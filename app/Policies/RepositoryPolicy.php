<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\RepositoryUpload;
use App\Models\User;

class RepositoryPolicy
{
    // SuperAdmin bypass is handled globally via Gate::before() in AppServiceProvider.

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageOwnRepositories->value);
    }

    public function view(User $user, RepositoryUpload $repository): bool
    {
        return $repository->user_id === $user->id
            || $user->hasPermissionTo(Permission::ViewProjects->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageOwnRepositories->value);
    }

    public function delete(User $user, RepositoryUpload $repository): bool
    {
        return $repository->user_id === $user->id
            || $user->hasPermissionTo(Permission::DeleteProjects->value);
    }
}
