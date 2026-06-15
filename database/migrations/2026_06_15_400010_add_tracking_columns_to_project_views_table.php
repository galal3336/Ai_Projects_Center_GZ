<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_views', function (Blueprint $table) {
            $table->string('referrer', 500)->nullable()->after('ip_hash');
            $table->string('country', 2)->nullable()->after('referrer');
            $table->string('browser', 80)->nullable()->after('country');

            $table->index('country');
            $table->index('browser');
        });
    }

    public function down(): void
    {
        Schema::table('project_views', function (Blueprint $table) {
            $table->dropIndex(['country']);
            $table->dropIndex(['browser']);
            $table->dropColumn(['referrer', 'country', 'browser']);
        });
    }
};
