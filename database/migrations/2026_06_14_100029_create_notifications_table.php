<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Custom notifications table that extends Laravel's default with domain context.
        // We keep the standard Laravel 'notifications' UUID column pattern but add
        // typed columns for richer querying without JSON parsing on every query.
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->string('type');                          // FQCN: App\Notifications\ProjectApproved

            // Polymorphic notifiable (usually users)
            $table->string('notifiable_type');
            $table->unsignedBigInteger('notifiable_id');

            // Domain context columns (avoids parsing `data` JSON for filtering)
            $table->enum('category', [
                'project',          // project lifecycle events
                'review',           // admin review events
                'member',           // membership changes
                'award',            // award received
                'competition',      // competition updates
                'system',           // platform-wide announcements
                'account',          // auth / profile events
            ])->default('system')->index();

            $table->string('title');
            $table->string('title_ar')->nullable();
            $table->text('body')->nullable();
            $table->text('body_ar')->nullable();

            // Nullable UUID refs for deep-linking
            $table->uuid('project_id')->nullable()->index();
            $table->uuid('competition_id')->nullable()->index();

            $table->string('action_url')->nullable();        // frontend route
            $table->string('icon', 80)->nullable();          // lucide icon name
            $table->string('color', 7)->nullable();          // badge color

            $table->json('data')->nullable();                // full payload for extensibility

            // Priority for in-app inbox sorting
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');

            $table->timestamp('read_at')->nullable()->index();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            // ─── Indexes (names kept ≤64 chars for MySQL) ─────────────
            $table->index(['notifiable_type', 'notifiable_id', 'read_at'], 'notif_notifiable_read_idx');
            $table->index(['notifiable_type', 'notifiable_id', 'category', 'created_at'], 'notif_notifiable_cat_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
