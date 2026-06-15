<?php

namespace App\Jobs;

use App\DTOs\ProjectFilterDTO;
use App\Repositories\Eloquent\ProjectRepository;
use App\Services\Cache\ProjectCacheService;

/**
 * Pre-warms the public project list cache after a publish/archive event
 * so the first real visitor hits a warm cache, not a cold DB query.
 */
class WarmProjectCache extends BaseJob
{
    public function __construct()
    {
        $this->onQueue('cache');
    }

    public function handle(ProjectRepository $repo, ProjectCacheService $cache): void
    {
        // Warm page 1 of the default (latest) sort — the most-visited URL
        $filter = new ProjectFilterDTO(sort: 'published_at', direction: 'desc');

        $cache->invalidateAllProjects();

        $cache->rememberList($filter, fn () => $repo->paginate($filter, 20));

        // Also warm the featured carousel
        $cache->rememberFeatured(fn () => $repo->getFeatured(6));
    }
}
