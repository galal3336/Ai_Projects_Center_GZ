<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();

            $table->string('version_tag', 30);               // semver: "1.0.0", "2.1.3-beta"
            $table->string('title')->nullable();             // "Initial Release", "Bug Fixes"
            $table->text('changelog')->nullable();           // markdown changelog
            $table->text('changelog_ar')->nullable();
            $table->enum('type', ['major', 'minor', 'patch', 'pre_release'])->default('minor');
            $table->enum('status', ['draft', 'published', 'deprecated'])->default('published');
            $table->boolean('is_latest')->default(false);    // only one true per project
            $table->timestamp('released_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            // ─── Indexes ──────────────────────────────────────────────
            $table->unique(['project_id', 'version_tag']);
            $table->index(['project_id', 'is_latest']);
            $table->index(['project_id', 'released_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_versions');
    }
};
