<?php

namespace App\Http\Controllers;

use App\DTOs\ProjectFilterDTO;
use App\Http\Resources\ProjectResource;
use App\Models\Category;
use App\Models\Competition;
use App\Models\Technology;
use App\Services\Search\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __construct(private readonly SearchService $searchService) {}

    /**
     * Main search page — renders Search.tsx with paginated results.
     */
    public function index(Request $request): Response
    {
        $filter   = ProjectFilterDTO::fromRequest($request->all());
        $projects = $this->searchService->search($filter, perPage: 18);

        return Inertia::render('Search', [
            'projects'   => ProjectResource::collection($projects),
            'filters'    => $this->resolveActiveFilters($request),
            'facets'     => $this->facets(),
        ]);
    }

    /**
     * JSON typeahead endpoint — /api/search/suggest?q=...
     * Cached in Redis for 5 min.
     */
    public function suggest(Request $request): JsonResponse
    {
        $q       = $request->string('q')->trim()->toString();
        $results = $this->searchService->suggest($q);

        return response()->json($results);
    }

    // ─── Private helpers ──────────────────────────────────────────────

    /**
     * Returns the current active filter values to pass back to the page.
     */
    private function resolveActiveFilters(Request $request): array
    {
        return $request->only([
            'search', 'student_name', 'supervisor',
            'technology_id', 'technology_name',
            'competition_id', 'competition_name',
            'category_id', 'category_name',
            'award_name', 'award_rank',
            'academic_year', 'department',
            'winning_only', 'featured_only',
            'sort', 'direction',
        ]);
    }

    /**
     * Reference data for filter dropdowns — cached 10 min.
     */
    private function facets(): array
    {
        return \Illuminate\Support\Facades\Cache::tags(['search', 'facets'])
            ->remember('aikfs:search:facets', 600, function () {
                $categories = Category::where('is_active', true)
                    ->orderBy('sort_order')
                    ->get(['id', 'name', 'name_ar', 'slug', 'icon', 'color'])
                    ->map(fn ($c) => [
                        'id'   => $c->id,
                        'name' => app()->getLocale() === 'ar' ? ($c->name_ar ?? $c->name) : $c->name,
                        'slug' => $c->slug,
                        'icon' => $c->icon,
                    ]);

                $technologies = Technology::where('is_active', true)
                    ->orderByDesc('usage_count')
                    ->limit(60)
                    ->get(['id', 'name', 'slug', 'type', 'color', 'icon_url'])
                    ->map(fn ($t) => [
                        'id'       => $t->id,
                        'name'     => $t->name,
                        'slug'     => $t->slug,
                        'type'     => $t->type,
                        'color'    => $t->color,
                        'icon_url' => $t->icon_url,
                    ]);

                $competitions = Competition::orderByDesc('academic_year')
                    ->get(['id', 'name', 'name_ar', 'slug', 'academic_year', 'level'])
                    ->map(fn ($c) => [
                        'id'           => $c->id,
                        'name'         => app()->getLocale() === 'ar' ? ($c->name_ar ?? $c->name) : $c->name,
                        'slug'         => $c->slug,
                        'academic_year'=> $c->academic_year,
                        'level'        => $c->level,
                    ]);

                $departments = \App\Models\Project::published()
                    ->public()
                    ->whereNotNull('department')
                    ->distinct()
                    ->orderBy('department')
                    ->pluck('department');

                $years = \App\Models\Project::published()
                    ->public()
                    ->whereNotNull('academic_year')
                    ->distinct()
                    ->orderByDesc('academic_year')
                    ->pluck('academic_year');

                return compact('categories', 'technologies', 'competitions', 'departments', 'years');
            });
    }
}
