<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\User;

class SettingsPolicy
{
    // SuperAdmin bypass is handled globally via Gate::before() in AppServiceProvider.

    public function view(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ViewSettings->value);
    }

    public function update(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageSettings->value);
    }

    public function manageHomepage(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageHomepage->value);
    }

    public function manageCredits(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageCredits->value);
    }

    public function manageLanguages(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ManageLanguages->value);
    }

    public function viewActivityLogs(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ViewActivityLogs->value);
    }

    public function viewAnalytics(User $user): bool
    {
        return $user->hasPermissionTo(Permission::ViewAnalytics->value);
    }
}
