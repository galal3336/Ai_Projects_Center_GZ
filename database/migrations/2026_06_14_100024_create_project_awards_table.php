<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_awards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();

            // optional link to a competition record
            $table->uuid('competition_id')->nullable();
            $table->foreign('competition_id')->references('id')->on('competitions')->nullOnDelete();

            $table->string('title');                         // "1st Place", "Best Innovation Award"
            $table->string('title_ar')->nullable();
            $table->string('issuer')->nullable();            // who gave the award
            $table->string('issuer_logo')->nullable();
            $table->enum('rank', [
                'first', 'second', 'third',
                'honorable_mention', 'finalist',
                'winner', 'special',
            ])->nullable();
            $table->date('awarded_at')->nullable();
            $table->year('academic_year')->nullable();
            $table->string('certificate_path')->nullable();  // scan of certificate
            $table->text('notes')->nullable();
            $table->boolean('is_verified')->default(false);  // admin-verified award
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // ─── Indexes ──────────────────────────────────────────────
            $table->index(['project_id', 'awarded_at']);
            $table->index(['competition_id', 'rank']);
            $table->index(['is_verified', 'awarded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_awards');
    }
};
