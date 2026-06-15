<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const SUPPORTED = ['en', 'ar'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolveLocale($request);

        App::setLocale($locale);

        $response = $next($request);

        if (method_exists($response, 'header')) {
            $response->header('Content-Language', $locale);
        }

        return $response;
    }

    private function resolveLocale(Request $request): string
    {
        // 1. Route segment: /{locale}/... (SEO-friendly URLs)
        $segment = $request->segment(1);
        if ($segment && in_array($segment, self::SUPPORTED, true)) {
            if (session('locale') !== $segment) {
                session(['locale' => $segment]);
            }
            return $segment;
        }

        // 2. Authenticated user preference (stored in DB)
        if (Auth::check() && in_array(Auth::user()->locale, self::SUPPORTED, true)) {
            return Auth::user()->locale;
        }

        // 3. Session (set by switcher or previous route segment)
        $sessionLocale = session('locale');
        if ($sessionLocale && in_array($sessionLocale, self::SUPPORTED, true)) {
            return $sessionLocale;
        }

        // 4. Accept-Language header
        $browserLocale = substr($request->getPreferredLanguage(self::SUPPORTED) ?? '', 0, 2);
        if (in_array($browserLocale, self::SUPPORTED, true)) {
            return $browserLocale;
        }

        return config('app.locale', 'en');
    }
}
