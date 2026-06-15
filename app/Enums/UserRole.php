<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin      = 'admin';
    case Student    = 'student';
    case Visitor    = 'visitor';

    public function label(): string
    {
        return match($this) {
            self::SuperAdmin => 'Super Admin',
            self::Admin      => 'Admin',
            self::Student    => 'Student',
            self::Visitor    => 'Visitor',
        };
    }

    public function permissions(): array
    {
        return match($this) {
            self::SuperAdmin => Permission::superAdminPermissions(),
            self::Admin      => Permission::adminPermissions(),
            self::Student    => Permission::studentPermissions(),
            self::Visitor    => Permission::visitorPermissions(),
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
