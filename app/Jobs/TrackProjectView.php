<?php

namespace App\Jobs;

use App\Models\Project;
use Illuminate\Support\Facades\Cache;

/**
 * Defers the view INSERT + counter increment off the HTTP request path.
 * Queued on "views" queue so it never blocks the "default" queue.
 */
class TrackProjectView extends BaseJob
{
    public int $tries   = 5;
    public int $timeout = 30;
    public int $backoff = 10;

    public function __construct(
        public readonly string  $projectId,
        public readonly ?int    $userId,
        public readonly ?string $ipHash,
        public readonly ?string $referrer,
        public readonly ?string $country,
        public readonly ?string $browser,
    ) {
        $this->onQueue('views');
    }

    public function handle(): void
    {
        // Deduplicate: same IP + project within 1 hour counts as one view
        if ($this->ipHash) {
            $dedupeKey = "view_dedup:{$this->projectId}:{$this->ipHash}";
            if (Cache::has($dedupeKey)) {
                return;
            }
            Cache::put($dedupeKey, 1, now()->addHour());
        }

        $project = Project::find($this->projectId);

        if (! $project) {
            return;
        }

        $project->views()->create(array_filter([
            'user_id'   => $this->userId,
            'ip_hash'   => $this->ipHash,
            'referrer'  => $this->referrer,
            'country'   => $this->country,
            'browser'   => $this->browser,
            'viewed_at' => now(),
        ], fn ($v) => $v !== null));

        $project->increment('views_count');
    }
}
