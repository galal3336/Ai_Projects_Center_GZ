<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds enterprise-grade security response headers on every request.
 * Covers XSS, clickjacking, MIME-sniffing, referrer leakage, and CSP.
 */
class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');

        // Strict-Transport-Security: only on HTTPS
        if ($request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains; preload'
            );
        }

        // Content-Security-Policy (skipped in local — Vite HMR uses IPv6 which CSP can't allowlist)
        if (! app()->environment('local')) {
            $csp = $this->buildCsp($request);
            $response->headers->set('Content-Security-Policy', $csp);
        }

        return $response;
    }

    private function buildCsp(Request $request): string
    {
        $isLocal = app()->environment('local');

        // WebSocket / Reverb host
        $wsScheme   = $request->isSecure() ? 'wss' : 'ws';
        $reverbHost = config('reverb.servers.reverb.host', 'localhost');
        $reverbPort = config('reverb.servers.reverb.port', 8080);
        $wsConnect  = "{$wsScheme}://{$reverbHost}:{$reverbPort}";

        // Vite dev server — allow both IPv4 and IPv6 localhost
        $viteOrigins = $isLocal
            ? ' http://localhost:5173 http://127.0.0.1:5173 http://[::1]:5173'
            : '';

        $directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'{$viteOrigins}",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com{$viteOrigins}",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' {$wsConnect} https://api.github.com{$viteOrigins}",
            "media-src 'self' blob:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            "worker-src 'self' blob:",
            "manifest-src 'self'",
        ];

        if ($request->isSecure()) {
            $directives[] = "upgrade-insecure-requests";
        }

        return implode('; ', $directives);
    }
}
