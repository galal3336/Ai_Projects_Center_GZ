<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // CreditsMembers: platform-level honorable mentions — people who contributed to
        // AIKFS itself or to the faculty (distinct from per-project members).
        // Think: "Meet the Team" page for the showcase platform.
        Schema::create('credits_members', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('title');                         // "Platform Lead", "UI Designer"
            $table->string('title_ar')->nullable();
            $table->string('bio')->nullable();
            $table->string('bio_ar')->nullable();
            $table->string('avatar')->nullable();
            $table->string('email')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('website_url')->nullable();

            $table->enum('type', [
                'developer',
                'designer',
                'supervisor',
                'advisor',
                'contributor',
                'alumni',
            ])->default('contributor');

            $table->year('contribution_year')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // ─── Indexes ──────────────────────────────────────────────
            $table->index(['is_active', 'sort_order']);
            $table->index(['type', 'is_featured']);
            $table->index('contribution_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credits_members');
    }
};
