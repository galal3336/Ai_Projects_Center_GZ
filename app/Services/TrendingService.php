<?php

namespace App\Services;

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TrendingService
{
    // Weights for the trending algorithm
    private const WEIGHT_STARS     = 4.0;
    private const WEIGHT_FOLLOWERS = 2.5;
    private const WEIGHT_VIEWS     = 1.0;
    private const WEIGHT_BOOKMARKS = 2.0;
    private const WEIGHT_DOWNLOADS = 1.5;

    // Decay factor: score halves every N hours
    private const HALF_LIFE_HOURS = 72;

    private const CACHE_TTL    = 60 * 30; // 30 min
    private const CACHE_KEY    = 'trending_projects';

    /**
     * Get trending projects (cached).
     */
    public function getTrending(int $limit = 20, string $window = '7d'): Collection
    {
        $cacheKey = self::CACHE_KEY . ":{$window}:{$limit}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($limit, $window) {
            return $this->computeTrending($limit, $window);
        });
    }

    /**
     * Force-recompute scores and persist to DB (run via scheduler).
     */
    public function recompute(string $window = '7d'): void
    {
        $since = $this->windowToCarbonSince($window);

        // Pull recent activity counts per project
        $stars = DB::table('project_stars')
            ->where('created_at', '>=', $since)
            ->selectRaw('project_id, COUNT(*) as cnt, MAX(created_at) as latest')
            ->groupBy('project_id')
            ->get()->keyBy('project_id');

        $followers = DB::table('project_followers')
            ->where('created_at', '>=', $since)
            ->selectRaw('project_id, COUNT(*) as cnt, MAX(created_at) as latest')
            ->groupBy('project_id')
            ->get()->keyBy('project_id');

        $views = DB::table('project_views')
            ->where('viewed_at', '>=', $since)
            ->selectRaw('project_id, COUNT(*) as cnt, MAX(viewed_at) as latest')
            ->groupBy('project_id')
            ->get()->keyBy('project_id');

        $bookmarks = DB::table('project_bookmarks')
            ->where('created_at', '>=', $since)
            ->selectRaw('project_id, COUNT(*) as cnt, MAX(created_at) as latest')
            ->groupBy('project_id')
            ->get()->keyBy('project_id');

        // Collect all active project IDs
        $ids = collect([$stars, $followers, $views, $bookmarks])
            ->flatMap(fn ($c) => $c->keys())
            ->unique();

        foreach ($ids as $projectId) {
            $age   = $this->ageDecay($stars[$projectId]->latest  ?? $followers[$projectId]->latest ?? now());
            $score = ($stars[$projectId]->cnt     ?? 0) * self::WEIGHT_STARS
                   + ($followers[$projectId]->cnt  ?? 0) * self::WEIGHT_FOLLOWERS
                   + ($views[$projectId]->cnt       ?? 0) * self::WEIGHT_VIEWS
                   + ($bookmarks[$projectId]->cnt   ?? 0) * self::WEIGHT_BOOKMARKS;

            $score *= $age;

            Project::where('id', $projectId)->update(['trending_score' => round($score, 4)]);
        }

        // Decay scores for projects with no recent activity
        Project::whereNotIn('id', $ids)->where('trending_score', '>', 0)->update(['trending_score' => 0]);

        Cache::forget(self::CACHE_KEY . ":{$window}:20");
        Cache::forget(self::CACHE_KEY . ":{$window}:10");
    }

    /**
     * Compute trending without persisting (for cache fill).
     */
    private function computeTrending(int $limit, string $window): Collection
    {
        $since = $this->windowToCarbonSince($window);

        return Project::published()
            ->public()
            ->with(['owner:id,name,username,avatar', 'category:id,name,slug,color'])
            ->where(function ($q) use ($since) {
                $q->whereHas('stars', fn ($s) => $s->where('created_at', '>=', $since))
                  ->orWhereHas('views', fn ($v) => $v->where('viewed_at', '>=', $since))
                  ->orWhereHas('followers', fn ($f) => $f->where('created_at', '>=', $since));
            })
            ->orderByDesc('trending_score')
            ->orderByDesc('stars_count')
            ->limit($limit)
            ->get();
    }

    private function ageDecay(mixed $latestActivity): float
    {
        $hoursOld = now()->diffInHours($latestActivity, absolute: true);
        return pow(0.5, $hoursOld / self::HALF_LIFE_HOURS);
    }

    private function windowToCarbonSince(string $window): \Carbon\Carbon
    {
        return match ($window) {
            '24h'  => now()->subDay(),
            '7d'   => now()->subWeek(),
            '30d'  => now()->subMonth(),
            default => now()->subWeek(),
        };
    }
}
