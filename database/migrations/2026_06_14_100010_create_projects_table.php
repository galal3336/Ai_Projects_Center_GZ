<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // ─── Ownership ─────────────────────────────────────────────
            // owner_id: the student who submitted the project
            $table->foreignId('owner_id')->constrained('users')->restrictOnDelete();
            // category is mandatory for filtering/indexing at scale
            $table->uuid('category_id')->nullable()->index();
            // optional competition link
            $table->uuid('competition_id')->nullable()->index();

            // ─── Core Identity ─────────────────────────────────────────
            $table->string('title');
            $table->string('title_ar')->nullable();
            $table->string('slug')->unique();
            $table->text('abstract');                        // short summary (~300 chars)
            $table->text('abstract_ar')->nullable();
            $table->longText('description')->nullable();     // rich HTML body
            $table->longText('description_ar')->nullable();
            $table->string('thumbnail')->nullable();         // primary display image path

            // ─── Academic Context ──────────────────────────────────────
            $table->string('department')->nullable();
            $table->year('academic_year')->nullable();
            $table->enum('academic_level', [
                'first_year', 'second_year', 'third_year', 'fourth_year',
                'graduate', 'postgraduate',
            ])->nullable();
            $table->string('supervisor_name')->nullable();
            $table->string('supervisor_email')->nullable();
            $table->string('course_name')->nullable();

            // ─── Status & Visibility ───────────────────────────────────
            $table->enum('status', [
                'draft',        // owner editing, not submitted
                'pending',      // submitted, awaiting admin review
                'revision',     // admin requested changes
                'approved',     // admin approved, not yet published
                'published',    // live and visible
                'archived',     // removed from feed but accessible via link
                'rejected',     // rejected by admin
            ])->default('draft')->index();

            $table->enum('visibility', [
                'public',       // anyone can see
                'university',   // authenticated university users only
                'private',      // owner + admins only
            ])->default('public');

            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('allow_comments')->default(true);
            $table->boolean('allow_downloads')->default(true);

            // ─── Review & Moderation ───────────────────────────────────
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();        // admin-to-student feedback
            $table->timestamp('published_at')->nullable()->index();
            $table->timestamp('submitted_at')->nullable();

            // ─── Metrics (denormalized for O(1) list queries) ──────────
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('downloads_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedSmallInteger('members_count')->default(1);
            $table->unsignedSmallInteger('images_count')->default(0);
            $table->unsignedSmallInteger('files_count')->default(0);
            $table->unsignedSmallInteger('versions_count')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0.00);
            $table->unsignedInteger('ratings_count')->default(0);

            // ─── SEO ───────────────────────────────────────────────────
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->json('seo_keywords')->nullable();

            // ─── Extra ─────────────────────────────────────────────────
            $table->json('tags')->nullable();                // lightweight tagging without pivot table
            $table->json('meta')->nullable();                // arbitrary extensible metadata

            $table->timestamps();
            $table->softDeletes();

            // ─── Foreign Keys ──────────────────────────────────────────
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
            $table->foreign('competition_id')->references('id')->on('competitions')->nullOnDelete();

            // ─── Composite Indexes (optimised for 100k+ rows) ──────────
            //
            // Primary list page: published + visibility + published_at DESC
            $table->index(['status', 'visibility', 'published_at']);
            // Featured carousel
            $table->index(['is_featured', 'status', 'published_at']);
            // Category browse
            $table->index(['category_id', 'status', 'published_at']);
            // Competition projects
            $table->index(['competition_id', 'status']);
            // Owner dashboard
            $table->index(['owner_id', 'status', 'created_at']);
            // Department filter
            $table->index(['department', 'academic_year', 'status']);
            // Trending (views)
            $table->index(['status', 'views_count']);
            // Admin review queue
            $table->index(['status', 'submitted_at']);

            // Full-text search on title + abstract (MySQL FULLTEXT)
            // Note: applied separately via DB::statement below
        });

        // MySQL FULLTEXT index for native search (faster than LIKE at 100k+)
        \DB::statement(
            'ALTER TABLE projects ADD FULLTEXT INDEX ft_projects_search (title, title_ar, abstract, abstract_ar)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
