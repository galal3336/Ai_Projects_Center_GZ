<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Master language registry (distinct from technologies — natural languages for content)
        Schema::create('languages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 80);                      // "Arabic", "English", "French"
            $table->string('name_native', 80)->nullable();   // "العربية", "English"
            $table->string('code', 10)->unique();            // ISO 639-1: "ar", "en", "fr"
            $table->string('flag_emoji', 10)->nullable();    // "🇪🇬"
            $table->boolean('is_rtl')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Pivot: content languages used in a project (e.g. Arabic UI + English docs)
        Schema::create('project_languages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('language_id');

            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
            $table->foreign('language_id')->references('id')->on('languages')->cascadeOnDelete();

            $table->enum('usage', [
                'primary',          // main project language
                'secondary',        // also supported
                'documentation',    // docs written in this language
                'interface',        // UI language
            ])->default('primary');

            $table->timestamps();

            $table->unique(['project_id', 'language_id']);
            $table->index('language_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_languages');
        Schema::dropIfExists('languages');
    }
};
