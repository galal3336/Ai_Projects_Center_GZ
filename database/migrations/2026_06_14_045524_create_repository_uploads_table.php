<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repository_uploads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('original_filename');
            $table->string('disk')->default('local');
            $table->string('zip_path');
            $table->string('extract_path');
            $table->unsignedBigInteger('zip_size_bytes')->default(0);
            $table->unsignedInteger('file_count')->default(0);
            $table->string('status')->default('pending');
            $table->text('error_message')->nullable();
            $table->json('file_tree')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repository_uploads');
    }
};
