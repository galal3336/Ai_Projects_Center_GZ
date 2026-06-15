<?php

namespace App\Services;

use App\Contracts\Repositories\ProjectRepositoryInterface;
use App\Contracts\Services\ProjectServiceInterface;
use App\DTOs\ProjectDTO;
use App\DTOs\ProjectFilterDTO;
use App\Enums\ProjectStatus;
use App\Events\Project\ProjectApproved;
use App\Events\Project\ProjectArchived;
use App\Events\Project\ProjectPublished;
use App\Events\Project\ProjectRejected;
use App\Events\Project\ProjectRevisionRequested;
use App\Events\Project\ProjectSubmitted;
use App\Models\Project;
use App\Models\User;
use App\Jobs\WarmProjectCache;
use App\Services\Activity\ActivityService;
use App\Services\Cache\ProjectCacheService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ProjectService implements ProjectServiceInterface
{
    public function __construct(
        protected ProjectRepositoryInterface $projectRepository,
        protected ActivityService $activityService,
        protected ProjectCacheService $cache,
    ) {}

    public function getPublicProjects(ProjectFilterDTO $filter): LengthAwarePaginator
    {
        return $this->cache->rememberList($filter, fn () => $this->projectRepository->paginate($filter));
    }

    public function getAdminProjects(ProjectFilterDTO $filter): LengthAwarePaginator
    {
        return $this->projectRepository->paginateForAdmin($filter);
    }

    public function getPendingReview(): LengthAwarePaginator
    {
        return $this->projectRepository->paginatePendingReview();
    }

    public function getById(string $id): Project
    {
        return $this->projectRepository->findById($id)
            ?? throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Project [{$id}] not found.");
    }

    public function getBySlug(string $slug): Project
    {
        return $this->cache->rememberShow($slug, function () use ($slug) {
            return $this->projectRepository->findBySlug($slug)
                ?? throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Project [{$slug}] not found.");
        });
    }

    public function create(User $owner, ProjectDTO $dto): Project
    {
        return DB::transaction(function () use ($owner, $dto) {
            $data = array_merge($dto->toArray(), [
                'owner_id' => $owner->id,
                'status'   => ProjectStatus::Draft->value,
                'slug'     => $this->uniqueSlug($dto->title),
            ]);

            $project = $this->projectRepository->create($data);

            if ($dto->technology_ids) {
                $this->projectRepository->syncTechnologies($project, $dto->technology_ids);
            }

            if ($dto->language_ids) {
                $this->projectRepository->syncLanguages($project, $dto->language_ids);
            }

            if ($dto->competition_ids) {
                $this->projectRepository->syncCompetitions($project, $dto->competition_ids);
            }

            $this->activityService->log('created', 'Project created', $project, $owner);
            $this->cache->invalidateAllProjects();

            return $project;
        });
    }

    public function update(Project $project, ProjectDTO $dto): Project
    {
        $this->assertEditable($project);

        return DB::transaction(function () use ($project, $dto) {
            $data = $dto->toArray();

            // Only re-slug if title changed
            if ($dto->title !== $project->title) {
                $data['slug'] = $this->uniqueSlug($dto->title, $project->id);
            }

            $updated = $this->projectRepository->update($project, $data);

            if ($dto->technology_ids !== null) {
                $this->projectRepository->syncTechnologies($updated, $dto->technology_ids);
            }

            if ($dto->language_ids !== null) {
                $this->projectRepository->syncLanguages($updated, $dto->language_ids);
            }

            if ($dto->competition_ids !== null) {
                $this->projectRepository->syncCompetitions($updated, $dto->competition_ids);
            }

            $this->activityService->log('updated', 'Project updated', $updated);
            $this->cache->invalidateProject($updated->slug);

            return $updated;
        });
    }

    public function delete(Project $project): void
    {
        $slug = $project->slug;
        $this->projectRepository->delete($project);
        $this->activityService->log('deleted', 'Project deleted', $project);
        $this->cache->invalidateProject($slug);
        $this->cache->invalidateHof();
    }

    // ─── Workflow transitions ──────────────────────────────────────────

    public function submit(Project $project): Project
    {
        $this->assertStatus($project, [ProjectStatus::Draft, ProjectStatus::Revision]);

        $updated = $this->projectRepository->update($project, [
            'status'       => ProjectStatus::Pending->value,
            'submitted_at' => now(),
        ]);

        $this->activityService->log('submitted', 'Project submitted for review', $updated);

        ProjectSubmitted::dispatch($updated, $updated->owner);

        return $updated;
    }

    public function approve(Project $project, User $reviewer): Project
    {
        $this->assertStatus($project, [ProjectStatus::Pending, ProjectStatus::Revision]);

        $updated = $this->projectRepository->update($project, [
            'status'              => ProjectStatus::Approved->value,
            'reviewed_by'         => $reviewer->id,
            'reviewed_at'         => now(),
            'rejection_notes'     => null,
        ]);

        $this->activityService->log('approved', 'Project approved', $updated, $reviewer);

        ProjectApproved::dispatch($updated, $reviewer);

        return $updated;
    }

    public function reject(Project $project, User $reviewer, string $notes): Project
    {
        $this->assertStatus($project, [ProjectStatus::Pending, ProjectStatus::Revision]);

        $updated = $this->projectRepository->update($project, [
            'status'          => ProjectStatus::Rejected->value,
            'reviewed_by'     => $reviewer->id,
            'reviewed_at'     => now(),
            'rejection_notes' => $notes,
        ]);

        $this->activityService->log('rejected', 'Project rejected', $updated, $reviewer, ['notes' => $notes]);

        ProjectRejected::dispatch($updated, $reviewer, $notes);

        return $updated;
    }

    public function publish(Project $project): Project
    {
        $this->assertStatus($project, [ProjectStatus::Approved]);

        $updated = $this->projectRepository->update($project, [
            'status'       => ProjectStatus::Published->value,
            'published_at' => now(),
        ]);

        $this->activityService->log('published', 'Project published', $updated);

        ProjectPublished::dispatch($updated);
        $this->cache->invalidateProject($updated->slug);
        $this->cache->invalidateHof();
        $this->cache->invalidateFeatured();
        WarmProjectCache::dispatch()->onQueue('cache');

        return $updated;
    }

    public function requestRevision(Project $project, User $reviewer, string $notes): Project
    {
        $this->assertStatus($project, [ProjectStatus::Pending]);

        $updated = $this->projectRepository->update($project, [
            'status'          => ProjectStatus::Revision->value,
            'reviewed_by'     => $reviewer->id,
            'reviewed_at'     => now(),
            'rejection_notes' => $notes,
        ]);

        $this->activityService->log('revision_requested', 'Revision requested', $updated, $reviewer, ['notes' => $notes]);

        ProjectRevisionRequested::dispatch($updated, $reviewer, $notes);

        return $updated;
    }

    public function archive(Project $project): Project
    {
        $this->assertStatus($project, [ProjectStatus::Published, ProjectStatus::Approved]);

        $updated = $this->projectRepository->update($project, [
            'status' => ProjectStatus::Archived->value,
        ]);

        $this->activityService->log('archived', 'Project archived', $updated);

        ProjectArchived::dispatch($updated);
        $this->cache->invalidateProject($updated->slug);
        $this->cache->invalidateHof();

        return $updated;
    }

    public function incrementViews(Project $project, array $meta = []): void
    {
        $this->projectRepository->incrementViews($project, $meta);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private function assertEditable(Project $project): void
    {
        if (! $project->status->canBeEditedByOwner()) {
            throw new HttpException(422, "Project cannot be edited in status [{$project->status->value}].");
        }
    }

    private function assertStatus(Project $project, array $allowed): void
    {
        if (! in_array($project->status, $allowed)) {
            $allowedLabels = implode(', ', array_map(fn ($s) => $s->value, $allowed));
            throw new HttpException(422, "Project must be in [{$allowedLabels}] to perform this action.");
        }
    }

    private function uniqueSlug(string $title, ?string $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        // sharedLock() inside the caller's transaction prevents concurrent duplicates.
        while ($this->projectRepository->slugExists($slug, $excludeId)) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
