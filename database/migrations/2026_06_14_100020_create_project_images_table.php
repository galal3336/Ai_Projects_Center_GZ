<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_images', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();

            $table->string('path');                          // storage relative path
            $table->string('disk', 20)->default('public');
            $table->string('original_name')->nullable();
            $table->string('alt_text')->nullable();          // accessibility
            $table->string('caption')->nullable();
            $table->string('caption_ar')->nullable();
            $table->unsignedInteger('size_bytes')->nullable();
            $table->unsignedSmallInteger('width')->nullable();
            $table->unsignedSmallInteger('height')->nullable();
            $table->string('mime_type', 50)->nullable();
            $table->boolean('is_cover')->default(false);     // only one per project
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            // ─── Indexes ──────────────────────────────────────────────
            $table->index(['project_id', 'sort_order']);
            $table->index(['project_id', 'is_cover']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_images');
    }
};
