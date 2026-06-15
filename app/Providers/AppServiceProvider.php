<?php

namespace App\Providers;

use App\Contracts\Services\CacheServiceInterface;
use App\Enums\Permission;
use App\Models\Category;
use App\Models\Competition;
use App\Models\Project;
use App\Models\User;
use App\Policies\CategoryPolicy;
use App\Policies\CompetitionPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\SettingsPolicy;
use App\Policies\UserPolicy;
use App\Services\Ai\AiService;
use App\Services\Cache\CacheService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CacheServiceInterface::class, CacheService::class);
        $this->app->singleton(AiService::class);
    }

    public function boot(): void
    {
        $this->configureMassAssignment();
        $this->configurePasswordValidation();
        $this->configureJsonResources();
        $this->configureSuperAdminGate();
        $this->registerPolicies();
        $this->registerNamedGates();

        if ($this->app->environment('local')) {
            $this->configureQueryLog();
        }
    }

    private function configureMassAssignment(): void
    {
        Model::shouldBeStrict(! app()->isProduction());
    }

    private function configurePasswordValidation(): void
    {
        Password::defaults(fn () => Password::min(8)
            ->letters()
            ->mixedCase()
            ->numbers()
            ->symbols()
            ->uncompromised()
        );
    }

    private function configureJsonResources(): void
    {
        JsonResource::withoutWrapping();
    }

    private function configureSuperAdminGate(): void
    {
        // Super Admin bypasses every gate/policy check automatically.
        Gate::before(function ($user) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });
    }

    private function registerPolicies(): void
    {
        Gate::policy(Project::class,     ProjectPolicy::class);
        Gate::policy(Category::class,    CategoryPolicy::class);
        Gate::policy(Competition::class, CompetitionPolicy::class);
        Gate::policy(User::class,        UserPolicy::class);
    }

    private function registerNamedGates(): void
    {
        // ─── Super Admin exclusive ────────────────────────────────────────
        Gate::define('manage-homepage', fn (User $user) =>
            $user->hasPermissionTo(Permission::ManageHomepage->value));

        Gate::define('manage-credits', fn (User $user) =>
            $user->hasPermissionTo(Permission::ManageCredits->value));

        Gate::define('manage-settings', fn (User $user) =>
            $user->hasPermissionTo(Permission::ManageSettings->value));

        Gate::define('manage-languages', fn (User $user) =>
            $user->hasPermissionTo(Permission::ManageLanguages->value));

        Gate::define('manage-admins', fn (User $user) =>
            $user->hasPermissionTo(Permission::ManageAdmins->value));

        // ─── Analytics ────────────────────────────────────────────────────
        Gate::define('view-analytics', fn (User $user) =>
            $user->hasPermissionTo(Permission::ViewAnalytics->value));

        Gate::define('view-own-analytics', fn (User $user) =>
            $user->hasPermissionTo(Permission::ViewOwnAnalytics->value)
            || $user->hasPermissionTo(Permission::ViewAnalytics->value));

        // ─── Settings (read) ──────────────────────────────────────────────
        Gate::define('view-settings', fn (User $user) =>
            $user->hasPermissionTo(Permission::ViewSettings->value));

        Gate::define('view-activity-logs', fn (User $user) =>
            $user->hasPermissionTo(Permission::ViewActivityLogs->value));
    }

    private function configureQueryLog(): void
    {
        DB::listen(function ($query) {
            if ($query->time > 500) {
                logger()->warning('Slow query detected', [
                    'sql'      => $query->sql,
                    'bindings' => $query->bindings,
                    'time_ms'  => $query->time,
                ]);
            }
        });
    }
}
