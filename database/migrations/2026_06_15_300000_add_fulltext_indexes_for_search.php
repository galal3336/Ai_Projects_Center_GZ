<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Members: search by student name
        \DB::statement(
            'ALTER TABLE project_members ADD FULLTEXT INDEX ft_members_name (name)'
        );

        // Awards: search by award title and issuer
        \DB::statement(
            'ALTER TABLE project_awards ADD FULLTEXT INDEX ft_awards_title (title, title_ar, issuer)'
        );

        // Technologies: search by name (already has slug index but not fulltext)
        \DB::statement(
            'ALTER TABLE technologies ADD FULLTEXT INDEX ft_technologies_name (name)'
        );

        // Competitions: search by name
        \DB::statement(
            'ALTER TABLE competitions ADD FULLTEXT INDEX ft_competitions_name (name, name_ar)'
        );

        // Categories: search by name
        \DB::statement(
            'ALTER TABLE categories ADD FULLTEXT INDEX ft_categories_name (name, name_ar)'
        );
    }

    public function down(): void
    {
        \DB::statement('ALTER TABLE project_members DROP INDEX ft_members_name');
        \DB::statement('ALTER TABLE project_awards DROP INDEX ft_awards_title');
        \DB::statement('ALTER TABLE technologies DROP INDEX ft_technologies_name');
        \DB::statement('ALTER TABLE competitions DROP INDEX ft_competitions_name');
        \DB::statement('ALTER TABLE categories DROP INDEX ft_categories_name');
    }
};
