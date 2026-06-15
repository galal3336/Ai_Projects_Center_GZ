<?php

namespace App\Jobs\Ai;

use App\Enums\AiFeature;
use App\Jobs\BaseJob;
use App\Models\AiResult;
use App\Models\Project;
use App\Services\Ai\AiService;
use Throwable;

class FindSimilarProjects extends BaseJob
{
    public int $tries   = 3;
    public int $timeout = 90;
    public int $backoff = 30;

    public function __construct(
        public readonly string $resultId,
        public readonly string $projectId,
    ) {
        $this->onQueue(AiFeature::Similar->queue());
    }

    public function handle(AiService $ai): void
    {
        $result  = AiResult::findOrFail($this->resultId);
        $project = Project::with(['technologies', 'category', 'awards', 'members', 'links'])
            ->findOrFail($this->projectId);

        $result->markProcessing();

        // Build candidate pool: published projects in same category, excluding self (max 20)
        $candidates = Project::with('technologies')
            ->published()
            ->public()
            ->where('id', '!=', $this->projectId)
            ->where('category_id', $project->category_id)
            ->latest('views_count')
            ->limit(20)
            ->get()
            ->map(fn (Project $p) => [
                'id'           => $p->id,
                'title'        => $p->title,
                'category'     => $p->category?->name,
                'abstract'     => str($p->abstract)->limit(300)->value(),
                'technologies' => $p->technologies->pluck('name')->toArray(),
            ])
            ->toArray();

        $data = $ai->findSimilarProjects($project, $candidates);

        // Resolve titles for matched IDs
        if (! empty($data['matches'])) {
            $ids    = collect($data['matches'])->pluck('id')->toArray();
            $titles = Project::whereIn('id', $ids)
                ->pluck('title', 'id')
                ->toArray();

            $data['matches'] = collect($data['matches'])->map(function ($m) use ($titles) {
                $m['title'] = $titles[$m['id']] ?? 'Unknown';
                return $m;
            })->values()->toArray();
        }

        $result->markCompleted($data, [
            'model'         => $data['model'],
            'input_tokens'  => $data['input_tokens'],
            'output_tokens' => $data['output_tokens'],
        ]);
    }

    public function failed(Throwable $exception): void
    {
        parent::failed($exception);

        AiResult::where('id', $this->resultId)
            ->update([
                'status'        => 'failed',
                'error_message' => $exception->getMessage(),
                'completed_at'  => now(),
            ]);
    }
}
