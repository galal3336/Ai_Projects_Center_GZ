<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->unsignedBigInteger('stars_count')->default(0)->after('likes_count');
            $table->unsignedBigInteger('bookmarks_count')->default(0)->after('stars_count');
            $table->unsignedBigInteger('followers_count')->default(0)->after('bookmarks_count');
            $table->float('trending_score')->default(0)->after('followers_count');
            $table->index('trending_score');
            $table->index('stars_count');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['trending_score']);
            $table->dropIndex(['stars_count']);
            $table->dropColumn(['stars_count', 'bookmarks_count', 'followers_count', 'trending_score']);
        });
    }
};
