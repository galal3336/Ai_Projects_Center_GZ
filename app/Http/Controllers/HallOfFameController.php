<?php

namespace App\Http\Controllers;

use App\Models\Competition;
use App\Models\Project;
use App\Models\ProjectAward;
use App\Services\Cache\ProjectCacheService;
use App\Services\SeoMetaService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HallOfFameController extends Controller
{
    // HOF score weights
    const WEIGHT_VIEWS   = 0.25;
    const WEIGHT_STARS   = 0.30;
    const WEIGHT_AWARDS  = 0.30;
    const WEIGHT_QUALITY = 0.15;

    // Normalisation caps so score stays ≈ 0–10 000
    const CAP_VIEWS   = 50_000;
    const CAP_STARS   = 5_000;
    const CAP_AWARDS  = 10;
    const QUALITY_MAX = 100;

    public function __invoke(SeoMetaService $seo, ProjectCacheService $cache): Response
    {
        $data = $cache->rememberHof(fn () => [
            'topProjects' => $this->topProjects(),
            'topStudents' => $this->topStudents(),
            'hofAwards'   => $this->latestAwards(),
            'hofStats'    => $this->stats(),
        ]);

        return Inertia::render('HallOfFame', array_merge($data, [
            'seo' => $seo->forHallOfFame(),
        ]));
    }

    // ─── Top Projects ─────────────────────────────────────────────────

    private function topProjects(): array
    {
        // Compute HOF score in DB so we only pull the top 10 rows, not all published projects.
        $wViews   = self::WEIGHT_VIEWS   / self::CAP_VIEWS;
        $wStars   = self::WEIGHT_STARS   / self::CAP_STARS;
        $wAwards  = self::WEIGHT_AWARDS  / self::CAP_AWARDS;
        $wQuality = self::WEIGHT_QUALITY / self::QUALITY_MAX;

        $rows = DB::table('projects')
            ->leftJoin('categories', 'categories.id', '=', 'projects.category_id')
            ->leftJoin(
                DB::raw('(SELECT project_id, COUNT(*) as award_count FROM project_awards GROUP BY project_id) pa'),
                'pa.project_id', '=', 'projects.id'
            )
            ->where('projects.status', 'published')
            ->where('projects.visibility', 'public')
            ->whereNull('projects.deleted_at')
            ->select([
                'projects.id',
                'projects.title',
                'projects.title_ar',
                'projects.slug',
                'projects.thumbnail',
                'projects.department',
                'projects.academic_year',
                'projects.views_count',
                'projects.stars_count',
                'projects.average_rating',
                'projects.tags',
                'categories.name as category_name',
                'categories.name_ar as category_name_ar',
                'categories.color as category_color',
                DB::raw('COALESCE(pa.award_count, 0) as awards_count'),
                DB::raw(
                    "ROUND((
                        projects.views_count  * {$wViews}   +
                        projects.stars_count  * {$wStars}   +
                        COALESCE(pa.award_count, 0) * {$wAwards}  +
                        (projects.average_rating * 10) * {$wQuality}
                    ) * 10000) as hof_score"
                ),
            ])
            ->orderByDesc('hof_score')
            ->limit(10)
            ->get();

        return $rows->values()->map(function ($row, int $idx) {
            return [
                'id'             => $row->id,
                'title'          => $row->title,
                'title_ar'       => $row->title_ar,
                'slug'           => $row->slug,
                'thumbnail'      => $row->thumbnail,
                'category'       => $row->category_name,
                'category_ar'    => $row->category_name_ar,
                'category_color' => $row->category_color,
                'department'     => $row->department,
                'academic_year'  => $row->academic_year,
                'views_count'    => (int) $row->views_count,
                'stars_count'    => (int) $row->stars_count,
                'awards_count'   => (int) $row->awards_count,
                'hof_score'      => (int) $row->hof_score,
                'tags'           => json_decode($row->tags ?? '[]', true) ?? [],
                'rank'           => $idx + 1,
            ];
        })->all();
    }

    // ─── Top Students ─────────────────────────────────────────────────

    private function topStudents(): array
    {
        // Aggregate per student: sum of HOF scores across their published projects
        $rows = DB::table('projects')
            ->join('users', 'users.id', '=', 'projects.owner_id')
            ->leftJoin('user_profiles', 'user_profiles.user_id', '=', 'users.id')
            ->where('projects.status', 'published')
            ->where('projects.visibility', 'public')
            ->whereNull('projects.deleted_at')
            ->select([
                'users.id',
                'users.name',
                DB::raw('SUM(projects.views_count)  as total_views'),
                DB::raw('SUM(projects.stars_count)  as total_stars'),
                DB::raw('COUNT(projects.id)         as projects_count'),
                DB::raw('MAX(user_profiles.graduation_year) as graduation_year'),
                DB::raw('MAX(user_profiles.department)       as department'),
            ])
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('total_stars')
            ->limit(20)
            ->get();

        // Award counts per owner
        $awardCounts = DB::table('project_awards')
            ->join('projects', 'projects.id', '=', 'project_awards.project_id')
            ->whereNull('projects.deleted_at')
            ->select('projects.owner_id', DB::raw('count(*) as cnt'))
            ->groupBy('projects.owner_id')
            ->pluck('cnt', 'owner_id');

        $scored = $rows->map(function ($row) use ($awardCounts) {
            $awards = $awardCounts[$row->id] ?? 0;
            $views  = (int) $row->total_views;
            $stars  = (int) $row->total_stars;
            $score  = (int) round(
                ($views  / self::CAP_VIEWS  * self::WEIGHT_VIEWS  +
                 $stars  / self::CAP_STARS  * self::WEIGHT_STARS  +
                 $awards / self::CAP_AWARDS * self::WEIGHT_AWARDS)
                * 10_000
            );

            return [
                'id'             => $row->id,
                'name'           => $row->name,
                'avatar'         => null,
                'department'     => $row->department,
                'graduation_year'=> $row->graduation_year,
                'total_points'   => $score,
                'projects_count' => (int) $row->projects_count,
                'awards_count'   => $awards,
                'stars_count'    => $stars,
                'views_count'    => $views,
                'top_skills'     => [],
            ];
        });

        return $scored
            ->sortByDesc('total_points')
            ->values()
            ->take(10)
            ->map(fn ($item, $idx) => array_merge($item, ['rank' => $idx + 1]))
            ->values()
            ->all();
    }

    // ─── Latest Awards ────────────────────────────────────────────────

    private function latestAwards(): array
    {
        return ProjectAward::with(
            'project:id,title,title_ar,slug',
            'competition:id,name,name_ar'
        )
            ->orderByDesc('awarded_at')
            ->orderByDesc('created_at')
            ->limit(12)
            ->get()
            ->map(fn (ProjectAward $a) => [
                'id'              => $a->id,
                'title'           => $a->title,
                'title_ar'        => $a->title_ar,
                'issuer'          => $a->issuer,
                'rank'            => $a->rank,
                'awarded_at'      => $a->awarded_at?->toDateString(),
                'academic_year'   => $a->academic_year,
                'is_verified'     => $a->is_verified,
                'project_title'   => $a->project?->title,
                'project_title_ar'=> $a->project?->title_ar,
                'project_slug'    => $a->project?->slug,
                'competition_name'=> $a->competition?->name,
                'competition_name_ar' => $a->competition?->name_ar,
            ])
            ->all();
    }

    // ─── Stats ────────────────────────────────────────────────────────

    private function stats(): array
    {
        $row = DB::table('projects as p')
            ->selectRaw("SUM(p.status = 'published') as projects_judged")
            ->first();

        return [
            'projects_judged'   => (int) ($row->projects_judged ?? 0),
            'students_competed' => (int) DB::table('competition_project')->distinct('project_id')->count('project_id'),
            'total_awards'      => (int) DB::table('project_awards')->count(),
            'competitions_held' => (int) DB::table('competitions')->where('status', 'completed')->count(),
        ];
    }
}
