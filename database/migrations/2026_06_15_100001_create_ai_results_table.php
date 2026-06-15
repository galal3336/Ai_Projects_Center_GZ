<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_results', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->string('feature');          // summary | similar | judge | tags
            $table->string('sub_type')->nullable(); // executive | technical | business (for summary)
            $table->string('status')->default('pending'); // pending | processing | completed | failed
            $table->longText('result')->nullable();       // JSON output from Claude
            $table->text('error_message')->nullable();
            $table->string('model')->nullable();          // claude model used
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->unsignedInteger('processing_ms')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'feature', 'status']);
            $table->index(['project_id', 'feature', 'sub_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_results');
    }
};
