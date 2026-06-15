<?php

use App\Console\Commands\RecomputeTrending;
use App\Jobs\WarmProjectCache;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Trending score recompute — every 30 min (already existed)
Schedule::command(RecomputeTrending::class, ['--window=7d'])->everyThirtyMinutes();

// Cache warm-up — run once per hour as a safety net in case Redis was flushed
Schedule::job(new WarmProjectCache, 'cache')->hourly()->withoutOverlapping();

// Prune stale project_views older than 1 year to keep the table lean
Schedule::command('model:prune', ['--model' => \App\Models\ProjectView::class])
    ->daily()
    ->at('03:00');

// Clear expired cache entries (for file/database drivers — no-op on Redis but harmless)
Schedule::command('cache:prune-stale-tags')->hourly();

// Queue monitoring — restart stuck workers every 30 min on production
if (app()->isProduction()) {
    Schedule::command('queue:restart')->everyThirtyMinutes();
}
