<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

class UserPolicy
{
    // SuperAdmin bypass is handled globally via Gate::before() in AppServiceProvider.

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ViewUsers->value);
    }

    public function view(User $user, User $model): bool
    {
        // Users can always view their own profile
        if ($user->id === $model->id) {
            return true;
        }

        return $user->hasPermissionTo(Permission::ViewUsers->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::CreateUsers->value);
    }

    public function update(User $user, User $model): bool
    {
        // Users can update their own profile
        if ($user->id === $model->id) {
            return true;
        }

        return $user->hasPermissionTo(Permission::EditUsers->value);
    }

    public function delete(User $user, User $model): bool
    {
        // Cannot delete yourself
        if ($user->id === $model->id) {
            return false;
        }

        return $user->hasPermissionTo(Permission::DeleteUsers->value);
    }

    public function impersonate(User $user, User $model): bool
    {
        // Cannot impersonate yourself or a super admin
        if ($user->id === $model->id || $model->isSuperAdmin()) {
            return false;
        }

        return $user->hasPermissionTo(Permission::ImpersonateUsers->value);
    }

    public function manageAdmins(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageAdmins->value);
    }
}
