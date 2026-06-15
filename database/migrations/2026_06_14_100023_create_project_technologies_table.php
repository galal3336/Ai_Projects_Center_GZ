<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Master technologies registry — reusable across all projects
        Schema::create('technologies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 80)->unique();
            $table->string('slug', 80)->unique();
            $table->enum('type', [
                'language',         // Python, PHP, TypeScript…
                'framework',        // Laravel, React, TensorFlow…
                'library',          // NumPy, Pandas, scikit-learn…
                'tool',             // Docker, Git, VS Code…
                'database',         // MySQL, Redis, MongoDB…
                'platform',         // AWS, GCP, Arduino…
                'protocol',         // REST, GraphQL, MQTT…
                'other',
            ])->default('other');
            $table->string('icon_url')->nullable();          // CDN URL of tech logo
            $table->string('color', 7)->nullable();          // brand hex color
            $table->string('website_url')->nullable();
            $table->unsignedInteger('usage_count')->default(0); // denormalized
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['type', 'is_active', 'usage_count']);
        });

        // Pivot: which technologies does a project use
        Schema::create('project_technologies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('technology_id');

            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
            $table->foreign('technology_id')->references('id')->on('technologies')->cascadeOnDelete();

            $table->boolean('is_primary')->default(false);   // highlight in card display
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['project_id', 'technology_id']);
            $table->index(['technology_id', 'project_id']); // reverse lookup for tech browse page
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_technologies');
        Schema::dropIfExists('technologies');
    }
};
