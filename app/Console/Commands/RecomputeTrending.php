<?php

namespace App\Console\Commands;

use App\Services\TrendingService;
use Illuminate\Console\Command;

class RecomputeTrending extends Command
{
    protected $signature   = 'trending:recompute {--window=7d : Time window (24h, 7d, 30d)}';
    protected $description = 'Recompute trending scores for all projects';

    public function handle(TrendingService $service): int
    {
        $window = $this->option('window');
        $this->info("Recomputing trending scores (window: {$window})…");
        $service->recompute($window);
        $this->info('Done.');
        return self::SUCCESS;
    }
}
