<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

abstract class BaseJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** @var int */
    public $tries = 3;
    /** @var int */
    public $timeout = 60;
    /** @var int */
    public $backoff = 30;

    public function failed(\Throwable $exception): void
    {
        logger()->error(static::class . ' failed', [
            'message' => $exception->getMessage(),
            'class'   => get_class($exception),
            'file'    => $exception->getFile() . ':' . $exception->getLine(),
            // Full trace is available in the failed_jobs table — excluded here
            // to avoid leaking API prompts or internal paths to application logs.
        ]);
    }
}
