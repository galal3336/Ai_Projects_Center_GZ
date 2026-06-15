<?php

namespace App\Jobs\Ai;

use App\Enums\AiFeature;
use App\Jobs\BaseJob;
use App\Models\AiResult;
use App\Models\Project;
use App\Services\Ai\AiService;
use Throwable;

class RunAiJudge extends BaseJob
{
    public int $tries   = 3;
    public int $timeout = 180;
    public int $backoff = 60;

    public function __construct(
        public readonly string $resultId,
        public readonly string $projectId,
    ) {
        $this->onQueue(AiFeature::Judge->queue());
    }

    public function handle(AiService $ai): void
    {
        $result  = AiResult::findOrFail($this->resultId);
        $project = Project::with(['technologies', 'category', 'awards', 'members', 'links', 'files', 'versions'])
            ->findOrFail($this->projectId);

        $result->markProcessing();

        $data = $ai->runJudge($project);

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
