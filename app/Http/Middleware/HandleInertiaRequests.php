<?php

namespace App\Http\Middleware;

use App\Services\Settings\SiteSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
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
        $user = $request->user();

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
            'locale'  => App::getLocale(),
            'flash'   => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
            ],
            'ziggy'   => fn () => [
                ...app('ziggy')->toArray(),
                'location' => $request->url(),
            ],
            'site' => fn () => app(SiteSettingService::class)->publicSettings(),
        ]);
    }
}
