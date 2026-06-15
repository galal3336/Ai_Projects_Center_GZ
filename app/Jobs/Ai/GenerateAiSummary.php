<?php

namespace App\Jobs\Ai;

use App\Enums\AiFeature;
use App\Jobs\BaseJob;
use App\Models\AiResult;
use App\Models\Project;
use App\Services\Ai\AiService;
use Throwable;

class GenerateAiSummary extends BaseJob
{
    public int $tries   = 3;
    public int $timeout = 120;
    public int $backoff = 30;

    public function __construct(
        public readonly string $resultId,
        public readonly string $projectId,
        public readonly string $type,  // executive | technical | business
    ) {
        $this->onQueue(AiFeature::Summary->queue());
    }

    public function handle(AiService $ai): void
    {
        $result  = AiResult::findOrFail($this->resultId);
        $project = Project::with(['technologies', 'category', 'awards', 'members', 'links'])
            ->findOrFail($this->projectId);

        $result->markProcessing();

        $data = $ai->generateSummary($project, $this->type);

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
