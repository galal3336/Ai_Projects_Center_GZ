<?php

namespace App\Repositories\Eloquent;

use App\Contracts\Repositories\ProjectRepositoryInterface;
use App\DTOs\ProjectFilterDTO;
use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ProjectRepository implements ProjectRepositoryInterface
{
    public function __construct(protected Project $model) {}

    public function findById(string $id): ?Project
    {
        return $this->model->with([
            'owner', 'category', 'technologies', 'languages',
            'members.user', 'awards', 'links', 'latestVersion',
        ])->find($id);
    }

    public function findBySlug(string $slug): ?Project
    {
        return $this->model->with([
            'owner', 'category', 'technologies', 'languages',
            'members.user', 'awards', 'links', 'latestVersion', 'images',
        ])->where('slug', $slug)->first();
    }

    public function paginate(ProjectFilterDTO $filter, int $perPage = 20): LengthAwarePaginator
    {
        return $this->buildPublicQuery($filter)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function paginateForAdmin(ProjectFilterDTO $filter, int $perPage = 20): LengthAwarePaginator
    {
        return $this->buildAdminQuery($filter)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function paginatePendingReview(int $perPage = 20): LengthAwarePaginator
    {
        return $this->model
            ->with(['owner', 'category'])
            ->whereIn('status', ProjectStatus::reviewable())
            ->orderBy('submitted_at')
            ->paginate($perPage);
    }

    // ─── Full Search (public-facing, all dimensions) ──────────────────

    public function search(ProjectFilterDTO $filter, int $perPage = 18): LengthAwarePaginator
    {
        $query = $this->model
            ->with(['owner', 'category', 'technologies', 'awards'])
            ->published()
            ->public();

        // ── Primary full-text search (title, abstract, description) ──
        if ($filter->search) {
            $term = $filter->search;
            $query->where(function (Builder $q) use ($term) {
                // Native MySQL FULLTEXT on projects table
                $q->whereFullText(
                    ['title', 'title_ar', 'abstract', 'abstract_ar'],
                    $term,
                    ['mode' => 'boolean'],
                );
            });
        }

        // ── Student name (search project_members.name) ────────────────
        if ($filter->student_name) {
            $term = $filter->student_name;
            $query->whereHas('members', function (Builder $q) use ($term) {
                $q->whereFullText(['name'], $term, ['mode' => 'boolean']);
            });
        }

        // ── Supervisor ────────────────────────────────────────────────
        if ($filter->supervisor) {
            $query->where('supervisor_name', 'like', '%' . $filter->supervisor . '%');
        }

        // ── Technology (by ID or name) ────────────────────────────────
        if ($filter->technology_id) {
            $query->whereHas('technologies', fn (Builder $q) =>
                $q->where('technologies.id', $filter->technology_id)
            );
        } elseif ($filter->technology_name) {
            $term = $filter->technology_name;
            $query->whereHas('technologies', function (Builder $q) use ($term) {
                $q->whereFullText(['name'], $term, ['mode' => 'boolean']);
            });
        }

        // ── Competition (by ID or name) ───────────────────────────────
        if ($filter->competition_id) {
            $query->whereHas('competitions', fn (Builder $q) =>
                $q->where('competitions.id', $filter->competition_id)
            );
        } elseif ($filter->competition_name) {
            $term = $filter->competition_name;
            $query->whereHas('competitions', function (Builder $q) use ($term) {
                $q->whereFullText(['name', 'name_ar'], $term, ['mode' => 'boolean']);
            });
        }

        // ── Category (by ID or name) ──────────────────────────────────
        if ($filter->category_id) {
            $query->where('category_id', $filter->category_id);
        } elseif ($filter->category_name) {
            $term = $filter->category_name;
            $query->whereHas('category', function (Builder $q) use ($term) {
                $q->whereFullText(['name', 'name_ar'], $term, ['mode' => 'boolean']);
            });
        }

        // ── Award name / rank ─────────────────────────────────────────
        if ($filter->award_name) {
            $term = $filter->award_name;
            $query->whereHas('awards', function (Builder $q) use ($term) {
                $q->whereFullText(['title', 'title_ar', 'issuer'], $term, ['mode' => 'boolean']);
            });
        }

        if ($filter->award_rank) {
            $query->whereHas('awards', fn (Builder $q) =>
                $q->where('rank', $filter->award_rank)
            );
        }

        // ── Winning projects (has any award) ──────────────────────────
        if ($filter->winning_only) {
            $query->whereHas('awards');
        }

        // ── Featured ──────────────────────────────────────────────────
        if ($filter->featured_only) {
            $query->featured();
        }

        // ── Standard filters ──────────────────────────────────────────
        if ($filter->academic_year) {
            $query->where('academic_year', $filter->academic_year);
        }

        if ($filter->department) {
            $query->where('department', $filter->department);
        }

        // ── Sorting ───────────────────────────────────────────────────
        $this->applySorting($query, $filter);

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Typeahead: returns project titles + student names matching $query.
     */
    public function suggest(string $query, int $limit = 8): array
    {
        $term = $query . '*'; // prefix wildcard for boolean mode

        $projects = $this->model
            ->published()
            ->public()
            ->whereFullText(['title', 'title_ar'], $term, ['mode' => 'boolean'])
            ->orderByDesc('views_count')
            ->limit($limit)
            ->pluck('title', 'slug');

        return $projects->map(fn ($title, $slug) => [
            'type'  => 'project',
            'label' => $title,
            'slug'  => $slug,
        ])->values()->all();
    }

    // ─── CRUD ─────────────────────────────────────────────────────────

    public function create(array $data): Project
    {
        return $this->model->create($data);
    }

    public function update(Project $project, array $data): Project
    {
        $project->update($data);

        return $project->refresh();
    }

    public function delete(Project $project): bool
    {
        return $project->delete();
    }

    public function restore(string $id): bool
    {
        return $this->model->withTrashed()->where('id', $id)->restore();
    }

    public function forceDelete(Project $project): bool
    {
        return $project->forceDelete();
    }

    public function syncTechnologies(Project $project, array $technologyIds): void
    {
        $project->technologies()->sync($technologyIds);
    }

    public function syncLanguages(Project $project, array $languageIds): void
    {
        $project->languages()->sync($languageIds);
    }

    public function syncCompetitions(Project $project, array $competitionIds): void
    {
        $project->competitions()->sync($competitionIds);
    }

    public function incrementViews(Project $project, array $meta = []): void
    {
        $project->views()->create(array_filter([
            'user_id'   => $meta['user_id'] ?? null,
            'ip_hash'   => $meta['ip_hash'] ?? null,
            'referrer'  => $meta['referrer'] ?? null,
            'country'   => $meta['country'] ?? null,
            'browser'   => $meta['browser'] ?? null,
            'viewed_at' => now(),
        ], fn ($v) => $v !== null));

        $project->increment('views_count');
    }

    public function incrementDownloads(Project $project): void
    {
        $project->increment('downloads_count');
    }

    public function getFeatured(int $limit = 6): Collection
    {
        return $this->model
            ->with(['owner', 'category', 'technologies'])
            ->published()
            ->public()
            ->featured()
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get();
    }

    public function getByCategory(string $categoryId, int $limit = 12): Collection
    {
        return $this->model
            ->with(['owner', 'technologies'])
            ->published()
            ->public()
            ->where('category_id', $categoryId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function countByStatus(): array
    {
        return $this->model
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    // ─── Private query builders ───────────────────────────────────────

    private function buildPublicQuery(ProjectFilterDTO $filter): Builder
    {
        $query = $this->model
            ->with(['owner', 'category', 'technologies'])
            ->published()
            ->public();

        $this->applyCommonFilters($query, $filter);

        return $query;
    }

    private function buildAdminQuery(ProjectFilterDTO $filter): Builder
    {
        $query = $this->model->with(['owner', 'category', 'reviewer']);

        if ($filter->owner_id) {
            $query->where('owner_id', $filter->owner_id);
        }

        if ($filter->status) {
            $query->where('status', $filter->status);
        }

        if ($filter->visibility) {
            $query->where('visibility', $filter->visibility);
        }

        $this->applyCommonFilters($query, $filter);

        return $query;
    }

    private function applyCommonFilters(Builder $query, ProjectFilterDTO $filter): void
    {
        if ($filter->search) {
            $query->whereFullText(
                ['title', 'title_ar', 'abstract', 'abstract_ar'],
                $filter->search,
            );
        }

        if ($filter->category_id) {
            $query->where('category_id', $filter->category_id);
        }

        if ($filter->academic_year) {
            $query->where('academic_year', $filter->academic_year);
        }

        if ($filter->department) {
            $query->where('department', $filter->department);
        }

        if ($filter->technology_id) {
            $query->whereHas('technologies', fn ($q) => $q->where('technologies.id', $filter->technology_id));
        }

        if ($filter->featured_only) {
            $query->featured();
        }

        $this->applySorting($query, $filter);
    }

    private function applySorting(Builder $query, ProjectFilterDTO $filter): void
    {
        $allowed   = ['published_at', 'created_at', 'views_count', 'downloads_count', 'likes_count', 'title'];
        $sort      = in_array($filter->sort, $allowed) ? $filter->sort : 'published_at';
        $direction = $filter->direction === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sort, $direction);
    }
}
