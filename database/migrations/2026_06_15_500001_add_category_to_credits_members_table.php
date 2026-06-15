<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('credits_members', function (Blueprint $table) {
            $table->enum('category', [
                'leadership',
                'core_team',
                'infrastructure',
                'localization',
                'contributors',
                'sponsors',
            ])->default('contributors')->after('type')->index();
        });
    }

    public function down(): void
    {
        Schema::table('credits_members', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }
};
