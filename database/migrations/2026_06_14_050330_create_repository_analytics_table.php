<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repository_analytics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('repository_upload_id');
            $table->foreign('repository_upload_id')
                  ->references('id')->on('repository_uploads')
                  ->cascadeOnDelete();

            // Totals
            $table->unsignedInteger('total_files')->default(0);
            $table->unsignedInteger('total_lines')->default(0);
            $table->unsignedInteger('code_lines')->default(0);
            $table->unsignedInteger('comment_lines')->default(0);
            $table->unsignedInteger('blank_lines')->default(0);
            $table->unsignedBigInteger('total_bytes')->default(0);

            // JSON breakdowns
            $table->json('languages');       // [{name, files, lines, bytes, percentage}]
            $table->json('frameworks');      // [{name, confidence, language}]
            $table->json('libraries');       // [{name, source, language}]
            $table->json('file_types');      // [{extension, count, bytes}]
            $table->json('top_files');       // [{path, lines, bytes, language}]

            // Computed at analysis time
            $table->string('primary_language')->nullable();
            $table->decimal('avg_file_size_kb', 10, 2)->default(0);
            $table->unsignedInteger('max_file_lines')->default(0);
            $table->string('analysed_at');

            $table->timestamps();
            $table->unique('repository_upload_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repository_analytics');
    }
};
