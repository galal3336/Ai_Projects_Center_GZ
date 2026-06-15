<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Category;
use App\Models\User;

class CategoryPolicy
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

    public function update(User $user, Category $category): bool
    {
        return $user->hasPermissionTo(Permission::ManageCategories->value);
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasPermissionTo(Permission::ManageCategories->value);
    }
}
