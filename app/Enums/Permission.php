<?php

namespace App\Enums;

enum Permission: string
{
    // ─── Super Admin ──────────────────────────────────────────────────
    case ManageHomepage    = 'manage_homepage';
    case ManageCredits     = 'manage_credits';
    case ManageSettings    = 'manage_settings';
    case ManageLanguages   = 'manage_languages';
    case ManageAdmins      = 'manage_admins';

    // ─── User management ──────────────────────────────────────────────
    case ViewUsers         = 'view_users';
    case CreateUsers       = 'create_users';
    case EditUsers         = 'edit_users';
    case DeleteUsers       = 'delete_users';
    case ImpersonateUsers  = 'impersonate_users';

    // ─── Analytics ────────────────────────────────────────────────────
    case ViewAnalytics     = 'view_analytics';
    case ViewOwnAnalytics  = 'view_own_analytics';

    // ─── Project management (Admin) ───────────────────────────────────
    case ViewProjects      = 'view_projects';
    case EditProjects      = 'edit_projects';
    case DeleteProjects    = 'delete_projects';
    case PublishProjects   = 'publish_projects';
    case ReviewProjects    = 'review_projects';
    case ApproveProjects   = 'approve_projects';
    case RejectProjects    = 'reject_projects';

    // ─── Own project management (Student) ─────────────────────────────
    case CreateOwnProjects = 'create_own_projects';
    case EditOwnProjects   = 'edit_own_projects';
    case SubmitProjects    = 'submit_projects';

    // ─── Category & Competition management ────────────────────────────
    case ManageCategories  = 'manage_categories';
    case ManageCompetitions = 'manage_competitions';

    // ─── System settings ──────────────────────────────────────────────
    case ViewSettings      = 'view_settings';
    case ViewActivityLogs  = 'view_activity_logs';

    // ─── Public content ───────────────────────────────────────────────
    case ViewPublicContent = 'view_public_content';

    // ─── Aggregates ───────────────────────────────────────────────────

    public static function all(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function superAdminPermissions(): array
    {
        return self::all();
    }

    public static function adminPermissions(): array
    {
        return [
            self::ViewProjects->value,
            self::EditProjects->value,
            self::DeleteProjects->value,
            self::PublishProjects->value,
            self::ReviewProjects->value,
            self::ApproveProjects->value,
            self::RejectProjects->value,
            self::ManageCategories->value,
            self::ManageCompetitions->value,
            self::ViewUsers->value,
            self::CreateUsers->value,
            self::EditUsers->value,
            self::ViewSettings->value,
            self::ViewActivityLogs->value,
            self::ViewAnalytics->value,
            self::ViewPublicContent->value,
        ];
    }

    public static function studentPermissions(): array
    {
        return [
            self::CreateOwnProjects->value,
            self::EditOwnProjects->value,
            self::SubmitProjects->value,
            self::ViewOwnAnalytics->value,
            self::ViewProjects->value,
            self::ViewPublicContent->value,
        ];
    }

    public static function visitorPermissions(): array
    {
        return [
            self::ViewPublicContent->value,
        ];
    }
}
