<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()?->hasAnyRole($roles)) {
            if ($request->expectsJson() || $request->inertia()) {
                abort(403, __('auth.unauthorized'));
            }

            return redirect()->route('dashboard')
                ->withErrors(['role' => __('auth.unauthorized')]);
        }

        return $next($request);
    }
}
