<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();

            $table->enum('type', [
                'github',
                'gitlab',
                'demo',             // live demo / hosted URL
                'video',            // YouTube, Vimeo demo
                'paper',            // IEEE / arXiv paper
                'figma',            // design prototype
                'huggingface',      // ML model hub
                'kaggle',           // dataset / notebook
                'playstore',        // Android app
                'appstore',         // iOS app
                'website',
                'documentation',
                'other',
            ])->default('other');

            $table->string('label')->nullable();             // custom link text
            $table->string('label_ar')->nullable();
            $table->string('url', 2048);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            // ─── Indexes ──────────────────────────────────────────────
            $table->index(['project_id', 'type']);
            $table->index(['project_id', 'is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_links');
    }
};
