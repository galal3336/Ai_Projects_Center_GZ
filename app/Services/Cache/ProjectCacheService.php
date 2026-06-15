<?php

namespace App\Services\Cache;

use App\DTOs\ProjectFilterDTO;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

/**
 * Centralised Redis cache layer for project list/show queries.
 *
 * Tag strategy:
 *   - "projects"       → invalidated whenever any project changes state/is published
 *   - "project:{id}"   → invalidated on per-project updates
 *   - "hof"            → Hall of Fame aggregate; invalidated on publish/archive
 *   - "featured"       → Featured carousel; invalidated on is_featured changes
 *   - "categories"     → Category list / project-count cache
 */
class ProjectCacheService
{
    private const TTL_LIST     = 300;      // 5 min — public project feed
    private const TTL_SHOW     = 900;      // 15 min — single project detail
    private const TTL_FEATURED = 600;      // 10 min — featured carousel
    private const TTL_HOF      = 1800;     // 30 min — Hall of Fame (heavy query)
    private const TTL_STATS    = 3600;     // 1 h   — project count stats
    private const TTL_CATS     = 3600;     // 1 h   — category list
    private const TTL_SUGGEST  = 120;      // 2 min — typeahead

    // ─── Public project list ──────────────────────────────────────────

    public function rememberList(ProjectFilterDTO $filter, \Closure $callback): LengthAwarePaginator
    {
        $key = 'projects:list:' . md5(serialize($filter));

        return Cache::tags(['projects'])->remember($key, self::TTL_LIST, $callback);
    }

    // ─── Single project show ──────────────────────────────────────────

    public function rememberShow(string $slug, \Closure $callback): Project
    {
        $key = "projects:show:{$slug}";

        return Cache::tags(['projects', "project:{$slug}"])->remember($key, self::TTL_SHOW, $callback);
    }

    // ─── Featured projects ────────────────────────────────────────────

    public function rememberFeatured(\Closure $callback): \Illuminate\Support\Collection
    {
        return Cache::tags(['projects', 'featured'])->remember(
            'projects:featured',
            self::TTL_FEATURED,
            $callback,
        );
    }

    // ─── Hall of Fame ─────────────────────────────────────────────────

    public function rememberHof(\Closure $callback): array
    {
        return Cache::tags(['hof', 'projects'])->remember('hof:full', self::TTL_HOF, $callback);
    }

    // ─── Stats (counts by status) ─────────────────────────────────────

    public function rememberStats(\Closure $callback): array
    {
        return Cache::tags(['projects'])->remember('projects:stats', self::TTL_STATS, $callback);
    }

    // ─── Category list ────────────────────────────────────────────────

    public function rememberCategories(\Closure $callback): \Illuminate\Support\Collection
    {
        return Cache::tags(['categories'])->remember('categories:all', self::TTL_CATS, $callback);
    }

    // ─── Typeahead suggest ────────────────────────────────────────────

    public function rememberSuggest(string $query, \Closure $callback): array
    {
        $key = 'projects:suggest:' . md5($query);

        return Cache::tags(['projects'])->remember($key, self::TTL_SUGGEST, $callback);
    }

    // ─── Invalidation ─────────────────────────────────────────────────

    public function invalidateProject(string $slug): void
    {
        Cache::tags(["project:{$slug}", 'projects'])->flush();
    }

    public function invalidateAllProjects(): void
    {
        Cache::tags(['projects'])->flush();
    }

    public function invalidateHof(): void
    {
        Cache::tags(['hof'])->flush();
    }

    public function invalidateFeatured(): void
    {
        Cache::tags(['featured'])->flush();
    }

    public function invalidateCategories(): void
    {
        Cache::tags(['categories'])->flush();
    }
}
