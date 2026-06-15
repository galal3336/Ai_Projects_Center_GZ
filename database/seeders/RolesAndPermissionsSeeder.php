<?php

namespace Database\Seeders;

use App\Enums\Permission;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission as SpatiePermission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create every permission defined in the enum
        foreach (Permission::cases() as $permission) {
            SpatiePermission::firstOrCreate([
                'name'       => $permission->value,
                'guard_name' => 'web',
            ]);
        }

        // Create all four roles
        $superAdmin = Role::firstOrCreate(['name' => UserRole::SuperAdmin->value, 'guard_name' => 'web']);
        $admin      = Role::firstOrCreate(['name' => UserRole::Admin->value,      'guard_name' => 'web']);
        $student    = Role::firstOrCreate(['name' => UserRole::Student->value,    'guard_name' => 'web']);
        $visitor    = Role::firstOrCreate(['name' => UserRole::Visitor->value,    'guard_name' => 'web']);

        // Super Admin: all permissions (Gate::before() also bypasses all gates)
        $superAdmin->syncPermissions(Permission::superAdminPermissions());

        // Admin: review/approve/reject projects, manage categories & competitions
        $admin->syncPermissions(Permission::adminPermissions());

        // Student: create/edit own projects, submit, view own analytics
        $student->syncPermissions(Permission::studentPermissions());

        // Visitor: view public content only
        $visitor->syncPermissions(Permission::visitorPermissions());
    }
}
