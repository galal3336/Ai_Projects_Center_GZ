<?php

namespace App\Contracts\Services;

use App\DTOs\ProjectDTO;
use App\DTOs\ProjectFilterDTO;
use App\Models\Project;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProjectServiceInterface
{
    public function getPublicProjects(ProjectFilterDTO $filter): LengthAwarePaginator;

    public function getAdminProjects(ProjectFilterDTO $filter): LengthAwarePaginator;

    public function getPendingReview(): LengthAwarePaginator;

    public function getById(string $id): Project;

    public function getBySlug(string $slug): Project;

    public function create(User $owner, ProjectDTO $dto): Project;

    public function update(Project $project, ProjectDTO $dto): Project;

    public function delete(Project $project): void;

    public function submit(Project $project): Project;

    public function approve(Project $project, User $reviewer): Project;

    public function reject(Project $project, User $reviewer, string $notes): Project;

    public function publish(Project $project): Project;

    public function requestRevision(Project $project, User $reviewer, string $notes): Project;

    public function archive(Project $project): Project;

    public function incrementViews(Project $project, array $meta = []): void;
}
