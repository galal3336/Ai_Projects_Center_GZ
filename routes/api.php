<?php

use App\Http\Controllers\AiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — AIKFS
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Health check
    Route::get('/ping', fn () => response()->json(['status' => 'ok', 'timestamp' => now()]))->name('ping');

    // ─── AI Features ──────────────────────────────────────────────────────────
    // Auth optional — results are readable by anyone; dispatch requires auth in production
    Route::prefix('ai')->name('ai.')->group(function () {
        // Dispatch a new AI job for a project
        Route::post('/projects/{project}/dispatch', [AiController::class, 'dispatch'])->name('dispatch');

        // List all AI results for a project
        Route::get('/projects/{project}/results', [AiController::class, 'projectResults'])->name('project-results');

        // Poll status of a specific result
        Route::get('/results/{result}', [AiController::class, 'status'])->name('status');

        // Get full result data (only when completed)
        Route::get('/results/{result}/data', [AiController::class, 'result'])->name('result');

        // Apply AI-generated tags to the project
        Route::post('/results/{result}/apply-tags', [AiController::class, 'applyTags'])->name('apply-tags');
    });
});
