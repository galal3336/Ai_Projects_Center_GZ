<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'superadmin@aikfs.edu.eg'],
            [
                'name'     => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('Admin@1234!'),
                'status'   => UserStatus::Active->value,
                'locale'   => 'en',
                'email_verified_at' => now(),
            ],
        );

        $user->assignRole(UserRole::SuperAdmin->value);

        UserProfile::firstOrCreate(['user_id' => $user->id], [
            'department' => 'Administration',
        ]);
    }
}
