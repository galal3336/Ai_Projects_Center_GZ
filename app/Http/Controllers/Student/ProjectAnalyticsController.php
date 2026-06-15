<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProjectAnalyticsController extends Controller
{
    public function __invoke(Request $request, Project $project): Response
    {
        $this->authorize('viewAnalytics', $project);

        $period = match ($request->query('period', '30d')) {
            '7d'  => 7,
            '90d' => 90,
            '1y'  => 365,
            default => 30,
        };

        $since = now()->subDays($period);

        // ── Views over time ───────────────────────────────────────────────
        $viewsByDay = DB::table('project_views')
            ->where('project_id', $project->id)
            ->where('viewed_at', '>=', $since)
            ->selectRaw('DATE(viewed_at) as date, COUNT(*) as views')
            ->groupByRaw('DATE(viewed_at)')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => ['date' => $r->date, 'views' => (int) $r->views]);

        // ── Unique visitors (by ip_hash distinct per day) ─────────────────
        $uniqueByDay = DB::table('project_views')
            ->where('project_id', $project->id)
            ->where('viewed_at', '>=', $since)
            ->whereNotNull('ip_hash')
            ->selectRaw('DATE(viewed_at) as date, COUNT(DISTINCT ip_hash) as unique_visitors')
            ->groupByRaw('DATE(viewed_at)')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $viewsTimeline = $viewsByDay->map(fn ($row) => [
            'date'            => $row['date'],
            'views'           => $row['views'],
            'unique_visitors' => (int) ($uniqueByDay[$row['date']]?->unique_visitors ?? 0),
        ]);

        // ── Top referrers ─────────────────────────────────────────────────
        $referrers = DB::table('project_views')
            ->where('project_id', $project->id)
            ->where('viewed_at', '>=', $since)
            ->whereNotNull('referrer')
            ->selectRaw('referrer, COUNT(*) as visits')
            ->groupBy('referrer')
            ->orderByDesc('visits')
            ->limit(10)
            ->get()
            ->map(fn ($r) => ['referrer' => $r->referrer, 'visits' => (int) $r->visits]);

        // ── Countries ─────────────────────────────────────────────────────
        $countries = DB::table('project_views')
            ->where('project_id', $project->id)
            ->where('viewed_at', '>=', $since)
            ->whereNotNull('country')
            ->selectRaw('country, COUNT(*) as visits')
            ->groupBy('country')
            ->orderByDesc('visits')
            ->limit(10)
            ->get()
            ->map(fn ($r) => ['country' => $r->country, 'visits' => (int) $r->visits]);

        // ── Browsers ─────────────────────────────────────────────────────
        $browsers = DB::table('project_views')
            ->where('project_id', $project->id)
            ->where('viewed_at', '>=', $since)
            ->whereNotNull('browser')
            ->selectRaw('browser, COUNT(*) as visits')
            ->groupBy('browser')
            ->orderByDesc('visits')
            ->get()
            ->map(fn ($r) => ['browser' => $r->browser, 'visits' => (int) $r->visits]);

        // ── Summary KPIs ──────────────────────────────────────────────────
        $totalViews = DB::table('project_views')
            ->where('project_id', $project->id)
            ->where('viewed_at', '>=', $since)
            ->count();

        $uniqueVisitors = DB::table('project_views')
            ->where('project_id', $project->id)
            ->where('viewed_at', '>=', $since)
            ->whereNotNull('ip_hash')
            ->distinct('ip_hash')
            ->count('ip_hash');

        $prevSince = now()->subDays($period * 2);
        $prevViews = DB::table('project_views')
            ->where('project_id', $project->id)
            ->whereBetween('viewed_at', [$prevSince, $since])
            ->count();

        $viewsTrend = $prevViews > 0
            ? (int) round((($totalViews - $prevViews) / $prevViews) * 100)
            : ($totalViews > 0 ? 100 : 0);

        return Inertia::render('Student/Projects/Analytics', [
            'project' => [
                'id'           => $project->id,
                'title'        => $project->title,
                'slug'         => $project->slug,
                'status'       => $project->status->value,
                'views_count'  => $project->views_count,
                'stars_count'  => $project->stars_count,
                'bookmarks_count' => $project->bookmarks_count,
                'followers_count' => $project->followers_count,
            ],
            'period'         => $request->query('period', '30d'),
            'summary' => [
                'total_views'     => $totalViews,
                'unique_visitors' => $uniqueVisitors,
                'views_trend'     => $viewsTrend,
            ],
            'views_timeline' => $viewsTimeline,
            'referrers'      => $referrers,
            'countries'      => $countries,
            'browsers'       => $browsers,
        ]);
    }
}
