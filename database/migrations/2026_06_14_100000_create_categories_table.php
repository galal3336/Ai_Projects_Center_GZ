<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Self-referencing hierarchy (unlimited depth via closure table pattern)
            $table->uuid('parent_id')->nullable()->index();

            $table->string('name');                          // en display name
            $table->string('name_ar')->nullable();           // ar display name
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('icon', 100)->nullable();         // lucide icon name
            $table->string('color', 7)->nullable();          // hex color
            $table->string('cover_image')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('projects_count')->default(0); // denormalized counter cache
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // ─── Indexes ──────────────────────────────────────────────
            $table->index(['is_active', 'sort_order']);
            $table->index(['parent_id', 'is_active']);
        });

        // Closure table for efficient nested category queries at scale
        Schema::create('category_closures', function (Blueprint $table) {
            $table->uuid('ancestor');
            $table->uuid('descendant');
            $table->unsignedTinyInteger('depth');

            $table->primary(['ancestor', 'descendant']);
            $table->index('descendant');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_closures');
        Schema::dropIfExists('categories');
    }
};
