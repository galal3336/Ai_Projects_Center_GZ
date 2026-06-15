<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // A project can enter multiple competitions; a competition has many projects.
    // This is a many-to-many pivot that extends beyond the single competition_id
    // on the projects table (which tracks the "primary" competition).
    public function up(): void
    {
        Schema::create('competition_project', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('competition_id');
            $table->uuid('project_id');

            $table->foreign('competition_id')->references('id')->on('competitions')->cascadeOnDelete();
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();

            $table->enum('submission_status', [
                'submitted',
                'shortlisted',
                'finalist',
                'winner',
                'disqualified',
                'withdrawn',
            ])->default('submitted');

            $table->enum('award_rank', [
                'first', 'second', 'third',
                'honorable_mention', 'finalist', 'special',
            ])->nullable();

            $table->unsignedSmallInteger('submission_number')->nullable(); // sequential within competition
            $table->text('submission_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('evaluated_at')->nullable();
            $table->foreignId('evaluated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['competition_id', 'project_id']);
            $table->index(['competition_id', 'submission_status']);
            $table->index(['project_id', 'submission_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_project');
    }
};
