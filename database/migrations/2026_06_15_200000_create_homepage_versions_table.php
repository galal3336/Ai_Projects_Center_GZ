<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_versions', function (Blueprint $table) {
            $table->id();
            $table->json('sections');                          // full section layout snapshot
            $table->string('label')->nullable();               // e.g. "Published v3"
            $table->boolean('is_published')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('is_published');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_versions');
    }
};
