<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('organizer')->nullable();
            $table->string('organizer_logo')->nullable();
            $table->string('website_url')->nullable();
            $table->string('cover_image')->nullable();
            $table->enum('level', ['university', 'national', 'regional', 'international'])->default('university');
            $table->enum('status', ['upcoming', 'active', 'completed', 'cancelled'])->default('upcoming');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->year('academic_year')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedInteger('projects_count')->default(0); // denormalized
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // ─── Indexes ──────────────────────────────────────────────
            $table->index(['status', 'start_date']);
            $table->index(['level', 'is_featured']);
            $table->index('academic_year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};
