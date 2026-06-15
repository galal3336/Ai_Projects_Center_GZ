<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    private const SUPPORTED = ['en', 'ar'];

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
        // 1. Authenticated user preference
        if (Auth::check() && in_array(Auth::user()->locale, self::SUPPORTED)) {
            return Auth::user()->locale;
        }

        // 2. Session
        $sessionLocale = session('locale');
        if ($sessionLocale && in_array($sessionLocale, self::SUPPORTED)) {
            return $sessionLocale;
        }

        // 3. Query param (for switching)
        $queryLocale = $request->query('locale');
        if ($queryLocale && in_array($queryLocale, self::SUPPORTED)) {
            session(['locale' => $queryLocale]);
            return $queryLocale;
        }

        // 4. Accept-Language header
        $browserLocale = substr($request->getPreferredLanguage(self::SUPPORTED) ?? '', 0, 2);
        if (in_array($browserLocale, self::SUPPORTED)) {
            return $browserLocale;
        }

        return config('app.locale', 'en');
    }
}
