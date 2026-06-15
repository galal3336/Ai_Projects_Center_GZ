<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // projects: speed up SoftDeletes WHERE deleted_at IS NULL on 100k+ rows
        Schema::table('projects', function (Blueprint $table) {
            $table->index('deleted_at', 'proj_deleted_at');
        });

        // project_views: dedup query (same ip + project within 1h)
        Schema::table('project_views', function (Blueprint $table) {
            $table->index(['ip_hash', 'project_id', 'viewed_at'], 'pv_ip_dedup');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('proj_deleted_at');
        });

        Schema::table('project_views', function (Blueprint $table) {
            $table->dropIndex('pv_ip_dedup');
        });
    }
};
