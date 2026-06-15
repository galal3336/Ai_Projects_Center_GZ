<?php

namespace App\Http\Middleware;

use App\Services\SeoMetaService;
use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user   = $request->user();
        $locale = App::getLocale();

        return array_merge(parent::share($request), [
            'auth' => [
                'user'        => $user ? [
                    'id'       => $user->id,
                    'name'     => $user->name,
                    'username' => $user->username,
                    'email'    => $user->email,
                    'avatar'   => $user->avatar,
                    'status'   => $user->status?->value,
                    'locale'   => $user->locale,
                    'role'     => $user->getPrimaryRole(),
                ] : null,
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
            ],
            'locale'    => $locale,
            'direction' => $locale === 'ar' ? 'rtl' : 'ltr',
            'flash'     => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
            ],
            'ziggy' => fn () => [
                ...(new \Tighten\Ziggy\Ziggy())->toArray(),
                'location' => $request->url(),
            ],
            'site' => fn () => app(SiteSettingService::class)->publicSettings(),

            // Default site-level SEO (pages override per-request via Inertia::share or page props)
            'seo' => fn () => app(SeoMetaService::class)->build(),

            'notifications' => fn () => $user ? [
                'unread_count' => Cache::remember(
                    "user:{$user->id}:unread_notifications",
                    60,
                    fn () => $user->unreadNotifications()->count()
                ),
            ] : null,

            // All UI translations shipped to the frontend once per page load.
            // Keys match lang/{locale}/ui.php structure.
            'translations' => fn () => [
                'ui'       => trans('ui'),
                'messages' => trans('messages'),
                'auth'     => trans('auth'),
            ],
        ]);
    }
}
