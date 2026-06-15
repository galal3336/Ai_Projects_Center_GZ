<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();

            $table->string('group', 64)->default('general'); // logical group: general, mail, seo, social…
            $table->string('key', 128);
            $table->longText('value')->nullable();
            $table->enum('type', ['string', 'integer', 'boolean', 'json', 'text', 'file'])->default('string');
            $table->string('label')->nullable();             // human-readable label
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);    // expose to frontend via Inertia share
            $table->boolean('is_encrypted')->default(false); // encrypt sensitive values at rest
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // ─── Indexes ──────────────────────────────────────────────
            $table->unique(['group', 'key']);
            $table->index(['group', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
