<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();

            // nullable user_id: external collaborators not yet on platform
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('name');                          // display name (mirrors user.name or external)
            $table->string('email')->nullable();
            $table->string('student_id', 20)->nullable();
            $table->enum('role', [
                'leader',           // project leader / main submitter
                'member',           // regular team member
                'supervisor',       // faculty supervisor
                'co_supervisor',    // co-supervisor
                'external',         // industry / external collaborator
            ])->default('member');
            $table->string('contribution')->nullable();      // brief contribution description
            $table->string('contribution_ar')->nullable();
            $table->string('avatar')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->boolean('is_confirmed')->default(false); // has the user accepted membership
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            // ─── Indexes ──────────────────────────────────────────────
            $table->unique(['project_id', 'user_id']);       // one row per user per project
            $table->index(['user_id', 'role']);
            $table->index(['project_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_members');
    }
};
