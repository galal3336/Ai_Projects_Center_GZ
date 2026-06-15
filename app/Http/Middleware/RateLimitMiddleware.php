<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter as FacadeRateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Fine-grained rate limiting per named limiter bucket.
 * Applied per-route via `throttle:<limiter>` middleware alias.
 */
class RateLimitMiddleware
{
    public function handle(Request $request, Closure $next, string $limiter = 'global'): Response
    {
        $key = $this->resolveKey($request, $limiter);

        [$maxAttempts, $decaySeconds] = $this->limiterConfig($limiter);

        if (FacadeRateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = FacadeRateLimiter::availableIn($key);

            app(\App\Services\Security\AuditLogService::class)->log(
                'rate_limit_exceeded',
                "Rate limit [{$limiter}] exceeded",
                ['limiter' => $limiter, 'ip' => $request->ip(), 'path' => $request->path()]
            );

            return response()->json([
                'message'     => 'Too many requests. Please slow down.',
                'retry_after' => $retryAfter,
            ], 429)->withHeaders([
                'Retry-After'               => $retryAfter,
                'X-RateLimit-Limit'         => $maxAttempts,
                'X-RateLimit-Remaining'     => 0,
                'X-RateLimit-Reset'         => now()->addSeconds($retryAfter)->timestamp,
            ]);
        }

        FacadeRateLimiter::hit($key, $decaySeconds);

        $response = $next($request);

        $remaining = max(0, $maxAttempts - FacadeRateLimiter::attempts($key));

        return $response->withHeaders([
            'X-RateLimit-Limit'     => $maxAttempts,
            'X-RateLimit-Remaining' => $remaining,
        ]);
    }

    private function resolveKey(Request $request, string $limiter): string
    {
        $userId = $request->user()?->id ?? 'guest';
        $ip     = $request->ip();

        return "rl:{$limiter}:{$userId}:{$ip}";
    }

    private function limiterConfig(string $limiter): array
    {
        // [maxAttempts, decaySeconds]
        return match ($limiter) {
            'api'           => [120, 60],   // 120 req/min for general API
            'search'        => [30, 60],    // 30 searches/min
            'upload'        => [10, 300],   // 10 uploads per 5 minutes
            'star'          => [60, 60],    // 60 star toggles/min
            'notification'  => [30, 60],    // 30 notification ops/min
            'admin'         => [200, 60],   // 200 req/min for admins
            'project-write' => [20, 60],    // 20 project writes/min
            default         => [60, 60],    // 60 req/min generic
        };
    }
}
