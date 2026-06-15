<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    // SuperAdmin bypass is handled globally via Gate::before() in AppServiceProvider.

    public function viewAny(): bool
    {
        return true;
    }

    public function view(?User $user, Project $project): bool
    {
        // Published public projects are visible to everyone (including guests)
        if ($project->status === ProjectStatus::Published && $project->visibility === ProjectVisibility::Public) {
            return true;
        }

        if (! $user) {
            return false;
        }

        // Owner or project member can always view
        if ($project->isOwnedBy($user) || $project->isMember($user)) {
            return true;
        }

        // University-only — any authenticated user
        if ($project->status === ProjectStatus::Published && $project->visibility === ProjectVisibility::University) {
            return true;
        }

        // Admins can view any project
        return $user->hasRole(['super_admin', 'admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::CreateOwnProjects->value);
    }

    public function update(User $user, Project $project): bool
    {
        if ($user->hasPermissionTo(Permission::EditProjects->value)) {
            return true;
        }

        return $project->isOwnedBy($user)
            && $user->hasPermissionTo(Permission::EditOwnProjects->value)
            && $project->status->canBeEditedByOwner();
    }

    public function delete(User $user, Project $project): bool
    {
        if ($user->hasPermissionTo(Permission::DeleteProjects->value)) {
            return true;
        }

        // Owners can only delete drafts
        return $project->isOwnedBy($user)
            && $project->status === ProjectStatus::Draft;
    }

    public function restore(User $user): bool
    {
        return $user->hasRole(['super_admin', 'admin']);
    }

    public function forceDelete(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    public function submit(User $user, Project $project): bool
    {
        return $user->hasPermissionTo(Permission::SubmitProjects->value)
            && $project->isOwnedBy($user)
            && in_array($project->status, [ProjectStatus::Draft, ProjectStatus::Revision]);
    }

    public function review(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ReviewProjects->value);
    }

    public function approve(User $user, Project $project): bool
    {
        return $user->hasPermissionTo(Permission::ApproveProjects->value)
            && in_array($project->status, [ProjectStatus::Pending, ProjectStatus::Revision]);
    }

    public function reject(User $user, Project $project): bool
    {
        return $user->hasPermissionTo(Permission::RejectProjects->value)
            && in_array($project->status, [ProjectStatus::Pending, ProjectStatus::Revision]);
    }

    public function requestRevision(User $user, Project $project): bool
    {
        return $user->hasPermissionTo(Permission::ReviewProjects->value)
            && $project->status === ProjectStatus::Pending;
    }

    public function publish(User $user, Project $project): bool
    {
        return $user->hasPermissionTo(Permission::PublishProjects->value)
            && $project->status === ProjectStatus::Approved;
    }

    public function archive(User $user, Project $project): bool
    {
        return $user->hasPermissionTo(Permission::PublishProjects->value)
            && in_array($project->status, [ProjectStatus::Published, ProjectStatus::Approved]);
    }

    public function viewRejectionNotes(User $user, Project $project): bool
    {
        return $project->isOwnedBy($user) || $user->hasRole(['super_admin', 'admin']);
    }

    public function viewAnalytics(User $user, Project $project): bool
    {
        if ($user->hasPermissionTo(Permission::ViewAnalytics->value)) {
            return true;
        }

        return $project->isOwnedBy($user)
            && $user->hasPermissionTo(Permission::ViewOwnAnalytics->value);
    }
}
