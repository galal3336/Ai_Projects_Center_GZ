<?php

namespace App\Contracts\Repositories;

use App\DTOs\ProjectFilterDTO;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ProjectRepositoryInterface
{
    public function findById(string $id): ?Project;

    public function findBySlug(string $slug): ?Project;

    public function paginate(ProjectFilterDTO $filter, int $perPage = 20): LengthAwarePaginator;

    public function paginateForAdmin(ProjectFilterDTO $filter, int $perPage = 20): LengthAwarePaginator;

    public function paginatePendingReview(int $perPage = 20): LengthAwarePaginator;

    /** Full multi-field search for the public /search endpoint. */
    public function search(ProjectFilterDTO $filter, int $perPage = 18): LengthAwarePaginator;

    /** Typeahead suggestions — returns [{type, label, slug}]. */
    public function suggest(string $query, int $limit = 8): array;

    public function slugExists(string $slug, ?string $excludeId = null): bool;

    public function create(array $data): Project;

    public function update(Project $project, array $data): Project;

    public function delete(Project $project): bool;

    public function restore(string $id): bool;

    public function forceDelete(Project $project): bool;

    public function syncTechnologies(Project $project, array $technologyIds): void;

    public function syncLanguages(Project $project, array $languageIds): void;

    public function syncCompetitions(Project $project, array $competitionIds): void;

    public function incrementViews(Project $project, array $meta = []): void;

    public function incrementDownloads(Project $project): void;

    public function getFeatured(int $limit = 6): Collection;

    public function getByCategory(string $categoryId, int $limit = 12): Collection;

    public function countByStatus(): array;
}
