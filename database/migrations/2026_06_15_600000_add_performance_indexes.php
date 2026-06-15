<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Performance indexes for 100k projects / 500k users scale.
 *
 * Covers:
 *   - project_views  : analytics queries by project + date window
 *   - project_stars  : toggle lookups + trending recompute
 *   - project_bookmarks: same pattern
 *   - project_followers: same pattern
 *   - projects       : trending_score sort
 *   - notifications  : unread feed per user (the most-queried notification pattern)
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── project_views ────────────────────────────────────────────────
        Schema::table('project_views', function (Blueprint $table) {
            // Trending recompute: count views per project in a time window
            $table->index(['project_id', 'viewed_at'], 'pv_project_viewed');
            // Unique-visitor dedup: one row per ip_hash per project per day
            $table->index(['project_id', 'ip_hash', 'viewed_at'], 'pv_dedup');
            // Analytics: all views for a user
            $table->index(['user_id', 'viewed_at'], 'pv_user_viewed');
        });

        // ── project_stars ────────────────────────────────────────────────
        Schema::table('project_stars', function (Blueprint $table) {
            // Trending recompute window query
            $table->index(['project_id', 'created_at'], 'ps_project_created');
            // User's starred feed (cursor paginate)
            $table->index(['user_id', 'created_at'], 'ps_user_created');
        });

        // ── project_bookmarks ────────────────────────────────────────────
        Schema::table('project_bookmarks', function (Blueprint $table) {
            $table->index(['project_id', 'created_at'], 'pb_project_created');
            $table->index(['user_id', 'created_at'], 'pb_user_created');
        });

        // ── project_followers ────────────────────────────────────────────
        Schema::table('project_followers', function (Blueprint $table) {
            $table->index(['project_id', 'created_at'], 'pf_project_created');
            $table->index(['user_id', 'created_at'], 'pf_user_created');
        });

        // ── projects: trending sort ───────────────────────────────────────
        Schema::table('projects', function (Blueprint $table) {
            // ORDER BY trending_score DESC on published+public rows
            $table->index(['status', 'visibility', 'trending_score'], 'proj_trending');
        });

        // ── notifications: unread feed ───────────────────────────────────
        Schema::table('notifications', function (Blueprint $table) {
            // The most common query: unread notifications for a user, newest first
            $table->index(['notifiable_id', 'notifiable_type', 'read_at', 'created_at'], 'notif_unread_feed');
        });
    }

    public function down(): void
    {
        Schema::table('project_views', function (Blueprint $table) {
            $table->dropIndex('pv_project_viewed');
            $table->dropIndex('pv_dedup');
            $table->dropIndex('pv_user_viewed');
        });

        Schema::table('project_stars', function (Blueprint $table) {
            $table->dropIndex('ps_project_created');
            $table->dropIndex('ps_user_created');
        });

        Schema::table('project_bookmarks', function (Blueprint $table) {
            $table->dropIndex('pb_project_created');
            $table->dropIndex('pb_user_created');
        });

        Schema::table('project_followers', function (Blueprint $table) {
            $table->dropIndex('pf_project_created');
            $table->dropIndex('pf_user_created');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('proj_trending');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notif_unread_feed');
        });
    }
};
