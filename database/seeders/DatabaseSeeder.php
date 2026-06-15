<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // Foundation — must run first (roles/permissions, super admin, settings)
            RolesAndPermissionsSeeder::class,
            SuperAdminSeeder::class,
            SiteSettingsSeeder::class,

            // Reference data
            CategorySeeder::class,
            TechnologySeeder::class,
            CompetitionSeeder::class,

            // Users (admins + students)
            UserSeeder::class,

            // Projects + members + technologies + links
            ProjectSeeder::class,

            // Stars, bookmarks, follows
            InteractionSeeder::class,

            // Credits page
            CreditsMemberSeeder::class,
        ]);
    }
}
