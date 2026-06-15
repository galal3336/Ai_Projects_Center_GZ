<?php

namespace App\Rbac;

use App\Enums\Permission;
use App\Enums\UserRole;

/**
 * Single source of truth for the RBAC permission matrix.
 *
 * Usage:
 *   PermissionMatrix::forRole(UserRole::Admin)      → string[]
 *   PermissionMatrix::matrix()                       → role → permissions[]
 *   PermissionMatrix::rolesWithPermission('approve_projects') → string[]
 *   PermissionMatrix::can(UserRole::Student, 'submit_projects') → bool
 */
final class PermissionMatrix
{
    /**
     * Full matrix: role → permissions[].
     *
     * Super Admin has every permission plus a Gate::before() bypass in AppServiceProvider,
     * so even permissions added later are automatically granted without re-seeding.
     */
    private static array $matrix = [
        UserRole::SuperAdmin->value => [
            // Full access
            Permission::ManageHomepage->value,
            Permission::ManageCredits->value,
            Permission::ManageSettings->value,
            Permission::ManageLanguages->value,
            Permission::ManageAdmins->value,
            Permission::ViewAnalytics->value,
            // All admin permissions
            Permission::ViewProjects->value,
            Permission::EditProjects->value,
            Permission::DeleteProjects->value,
            Permission::PublishProjects->value,
            Permission::ReviewProjects->value,
            Permission::ApproveProjects->value,
            Permission::RejectProjects->value,
            Permission::ManageCategories->value,
            Permission::ManageCompetitions->value,
            Permission::ViewUsers->value,
            Permission::CreateUsers->value,
            Permission::EditUsers->value,
            Permission::DeleteUsers->value,
            Permission::ImpersonateUsers->value,
            Permission::ViewSettings->value,
            Permission::ViewActivityLogs->value,
            // All student permissions
            Permission::CreateOwnProjects->value,
            Permission::EditOwnProjects->value,
            Permission::SubmitProjects->value,
            Permission::ViewOwnAnalytics->value,
            // Visitor
            Permission::ViewPublicContent->value,
        ],

        UserRole::Admin->value => [
            // Review Projects
            Permission::ReviewProjects->value,
            // Approve Projects
            Permission::ApproveProjects->value,
            // Reject Projects
            Permission::RejectProjects->value,
            // Manage Categories
            Permission::ManageCategories->value,
            // Manage Competitions
            Permission::ManageCompetitions->value,
            // General project access
            Permission::ViewProjects->value,
            Permission::EditProjects->value,
            Permission::DeleteProjects->value,
            Permission::PublishProjects->value,
            // User management
            Permission::ViewUsers->value,
            Permission::CreateUsers->value,
            Permission::EditUsers->value,
            // Settings (read-only)
            Permission::ViewSettings->value,
            Permission::ViewActivityLogs->value,
            // Analytics (all projects)
            Permission::ViewAnalytics->value,
            // Public
            Permission::ViewPublicContent->value,
        ],

        UserRole::Student->value => [
            // Create Projects
            Permission::CreateOwnProjects->value,
            // Edit Own Projects
            Permission::EditOwnProjects->value,
            // Submit Projects
            Permission::SubmitProjects->value,
            // View Analytics For Own Projects
            Permission::ViewOwnAnalytics->value,
            // Basic project visibility
            Permission::ViewProjects->value,
            // Public content
            Permission::ViewPublicContent->value,
        ],

        UserRole::Visitor->value => [
            // View Public Content
            Permission::ViewPublicContent->value,
        ],
    ];

    public static function matrix(): array
    {
        return self::$matrix;
    }

    public static function forRole(UserRole $role): array
    {
        return self::$matrix[$role->value] ?? [];
    }

    public static function can(UserRole $role, string $permission): bool
    {
        return in_array($permission, self::$matrix[$role->value] ?? [], true);
    }

    /** Returns the names of all roles that hold a given permission. */
    public static function rolesWithPermission(string $permission): array
    {
        $roles = [];
        foreach (self::$matrix as $role => $permissions) {
            if (in_array($permission, $permissions, true)) {
                $roles[] = $role;
            }
        }
        return $roles;
    }

    /** Returns an associative matrix suited for frontend consumption. */
    public static function toArray(): array
    {
        $roles       = UserRole::cases();
        $permissions = Permission::cases();
        $result      = [];

        foreach ($roles as $role) {
            $result[$role->value] = [];
            foreach ($permissions as $permission) {
                $result[$role->value][$permission->value] = self::can($role, $permission->value);
            }
        }

        return $result;
    }
}
