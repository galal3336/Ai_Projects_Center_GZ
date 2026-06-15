<?php

namespace App\Jobs;

use App\Models\RepositoryUpload;
use App\Services\Repository\RepositoryService;

class ExtractRepositoryZip extends BaseJob
{
    public int $tries   = 2;
    public int $timeout = 300; // 5 minutes for large repos
    public int $backoff = 10;

    public function __construct(public readonly RepositoryUpload $upload)
    {
        $this->onQueue('default');
    }

    public function handle(RepositoryService $service): void
    {
        $service->extract($this->upload);
    }
}
