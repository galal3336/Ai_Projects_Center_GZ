<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Competition;
use App\Models\User;

class CompetitionPolicy
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
        return $user->hasPermissionTo(Permission::ManageCompetitions->value);
    }

    public function update(User $user, Competition $competition): bool
    {
        return $user->hasPermissionTo(Permission::ManageCompetitions->value);
    }

    public function delete(User $user, Competition $competition): bool
    {
        return $user->hasPermissionTo(Permission::ManageCompetitions->value);
    }
}
