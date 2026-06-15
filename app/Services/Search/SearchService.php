<?php

namespace App\Services\Search;

use App\Contracts\Repositories\ProjectRepositoryInterface;
use App\DTOs\ProjectFilterDTO;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class SearchService
{
    private const TTL = 120; // 2 minutes — short to keep results fresh

    public function __construct(
        private readonly ProjectRepositoryInterface $projectRepository,
    ) {}

    public function search(ProjectFilterDTO $filter, int $perPage = 18): LengthAwarePaginator
    {
        // Don't cache paginated results beyond page 1 to avoid ballooning Redis memory
        if (request()->integer('page', 1) > 1 || !$filter->hasActiveFilters()) {
            return $this->projectRepository->search($filter, $perPage);
        }

        $key = 'aikfs:' . $filter->cacheKey();

        return Cache::tags(['search', 'projects'])
            ->remember($key, self::TTL, fn () => $this->projectRepository->search($filter, $perPage));
    }

    public function invalidate(): void
    {
        Cache::tags(['search'])->flush();
    }

    /**
     * Typeahead suggestions — fast, cached 5 min.
     */
    public function suggest(string $query, int $limit = 8): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        $key = 'aikfs:suggest:' . md5($query);

        return Cache::tags(['search'])
            ->remember($key, 300, function () use ($query, $limit) {
                return $this->projectRepository->suggest($query, $limit);
            });
    }
}
