<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\ProjectAward;
use App\Models\User;

class AwardPolicy
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
        return $user->hasPermissionTo(Permission::ManageAwards->value);
    }

    public function update(User $user, ProjectAward $award): bool
    {
        return $user->hasPermissionTo(Permission::ManageAwards->value);
    }

    public function delete(User $user, ProjectAward $award): bool
    {
        return $user->hasPermissionTo(Permission::ManageAwards->value);
    }

    public function verify(User $user, ProjectAward $award): bool
    {
        return $user->hasPermissionTo(Permission::ManageAwards->value)
            && ! $award->is_verified;
    }
}
