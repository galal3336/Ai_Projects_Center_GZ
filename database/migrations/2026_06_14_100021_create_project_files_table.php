<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();

            $table->enum('type', [
                'report',           // PDF/DOCX academic report
                'presentation',     // PPT/PDF slides
                'source_code',      // ZIP of source
                'dataset',          // CSV/JSON dataset
                'model',            // ML model weights
                'demo_video',       // MP4 demo
                'documentation',    // README / docs
                'other',
            ])->default('other');

            $table->string('label');                         // display name
            $table->string('label_ar')->nullable();
            $table->string('path');                          // storage path
            $table->string('disk', 20)->default('public');
            $table->string('original_name');
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('extension', 20)->nullable();
            $table->string('version_tag', 30)->nullable();   // e.g. "v1.0" cross-reference to versions
            $table->boolean('is_public')->default(true);     // private files require auth
            $table->unsignedInteger('downloads_count')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            // ─── Indexes ──────────────────────────────────────────────
            $table->index(['project_id', 'type']);
            $table->index(['project_id', 'is_public', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_files');
    }
};
