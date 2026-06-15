<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Technology;
use App\Models\User;

class TechnologyPolicy
{
    // SuperAdmin bypass is handled globally via Gate::before() in AppServiceProvider.

    public function viewAny(): bool
    {
        return true;
    }

    public function view(): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageCategories->value);
    }

    public function update(User $user, Technology $technology): bool
    {
        return $user->hasPermissionTo(Permission::ManageCategories->value);
    }

    public function delete(User $user, Technology $technology): bool
    {
        return $user->hasPermissionTo(Permission::ManageCategories->value);
    }
}
