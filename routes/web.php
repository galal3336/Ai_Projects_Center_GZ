<?php

use App\Http\Controllers\Admin\AwardController;
use App\Http\Controllers\Admin\CompetitionController;
use App\Http\Controllers\Admin\CreditsController;
use App\Http\Controllers\Admin\HomepageBuilderController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\HallOfFameController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FollowerController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RepositoryController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\StarController;
use App\Http\Controllers\Student\ProjectAnalyticsController;
use App\Http\Controllers\TechnologyController;
use App\Http\Controllers\TrendingController;
use App\Http\Middleware\SetLocale;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes — AIKFS
|--------------------------------------------------------------------------
|
| SEO-friendly locale-prefixed URLs:  /{locale}/...  (e.g. /ar/projects)
| The locale switcher route (/locale/{locale}) also exists for AJAX/session use.
|
*/

// ─── Sitemap & robots.txt (no locale prefix, crawlers access directly) ────────
Route::get('/sitemap.xml',          [SitemapController::class, 'index'])->name('sitemap.index');
Route::get('/sitemap-pages.xml',    [SitemapController::class, 'pages'])->name('sitemap.pages');
Route::get('/sitemap-projects.xml', [SitemapController::class, 'projects'])->name('sitemap.projects');
Route::get('/robots.txt',           [SitemapController::class, 'robots'])->name('robots');

// ─── Locale switcher (POST — GET would allow CSRF via img/link tags) ─────────
Route::post('/locale/{locale}', function (string $locale) {
    $supported = SetLocale::SUPPORTED;
    if (! in_array($locale, $supported, true)) {
        return back();
    }

    session(['locale' => $locale]);
    if (auth()->check()) {
        auth()->user()->update(['locale' => $locale]);
    }

    // Swap the locale segment in the referring URL so the URL stays consistent
    $referer = request()->headers->get('referer', '/');
    $parsed  = parse_url($referer);
    $path    = $parsed['path'] ?? '/';
    $segments = explode('/', ltrim($path, '/'));

    if (isset($segments[0]) && in_array($segments[0], $supported, true)) {
        $segments[0] = $locale;
    } else {
        array_unshift($segments, $locale);
    }

    $newPath = '/' . implode('/', $segments);
    $query   = isset($parsed['query']) ? '?' . $parsed['query'] : '';

    return redirect($newPath . $query);
})->name('locale.switch');

// ─── Locale-prefixed public & authenticated routes ────────────────────────────
// Each locale gets its own URL prefix so search engines index /en/* and /ar/* separately.
// The root (/) redirects to the preferred locale.
Route::get('/', function () {
    $locale = session('locale', app()->getLocale());
    return redirect()->route('home', ['locale' => $locale]);
});

Route::prefix('{locale}')
    ->where(['locale' => 'en|ar'])
    ->middleware('web')
    ->group(function () {

        // ─── Public (Visitor + all roles) ────────────────────────────────────
        Route::get('/', function () {
            return Inertia::render('Welcome', [
                'seo' => app(\App\Services\SeoMetaService::class)->build(),
            ]);
        })->name('home');

        Route::get('/hall-of-fame', HallOfFameController::class)->name('hall-of-fame');

        // Public project browsing
        Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
        Route::get('/projects/{slug}', [ProjectController::class, 'show'])->name('projects.show');

        // API helpers (no auth required — read-only reference data)
        Route::get('/api/categories', [CategoryController::class, 'apiList'])->name('api.categories');
        Route::get('/api/technologies', [TechnologyController::class, 'apiList'])->name('api.technologies');

        // Search
        Route::get('/search', [SearchController::class, 'index'])->name('search');
        Route::get('/api/search/suggest', [SearchController::class, 'suggest'])->name('api.search.suggest')
            ->middleware('throttle.custom:search');

        // Trending
        Route::get('/trending', [TrendingController::class, 'index'])->name('trending');
        Route::get('/api/trending', [TrendingController::class, 'api'])->name('api.trending')
            ->middleware('throttle.custom:api');

        // ─── Authenticated ────────────────────────────────────────────────────
        Route::middleware(['auth', 'verified'])->group(function () {

            Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

            // ─── Notifications ───────────────────────────────────────────────
            Route::prefix('notifications')->name('notifications.')->group(function () {
                Route::get('/', [NotificationController::class, 'index'])->name('index');
                Route::get('/fetch', [NotificationController::class, 'fetch'])->name('fetch');
                Route::post('/{id}/read', [NotificationController::class, 'markRead'])->name('read');
                Route::post('/read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
                Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
                Route::delete('/', [NotificationController::class, 'destroyAll'])->name('destroy-all');
            });

            // ─── Stars ───────────────────────────────────────────────────────
            Route::post('/projects/{project}/star', [StarController::class, 'toggle'])->name('projects.star')
                ->middleware('throttle.custom:star');
            Route::get('/me/stars', [StarController::class, 'index'])->name('me.stars');

            // ─── Bookmarks ───────────────────────────────────────────────────
            Route::post('/projects/{project}/bookmark', [BookmarkController::class, 'toggle'])->name('projects.bookmark')
                ->middleware('throttle.custom:star');
            Route::get('/me/bookmarks', [BookmarkController::class, 'index'])->name('me.bookmarks');

            // ─── Followers ───────────────────────────────────────────────────
            Route::post('/projects/{project}/follow', [FollowerController::class, 'toggle'])->name('projects.follow')
                ->middleware('throttle.custom:star');
            Route::get('/projects/{project}/followers', [FollowerController::class, 'followers'])->name('projects.followers');
            Route::get('/me/following', [FollowerController::class, 'index'])->name('me.following');

            // ─── Repository Explorer ─────────────────────────────────────────
            Route::prefix('repositories')->name('repositories.')->group(function () {
                Route::get('/', [RepositoryController::class, 'index'])->name('index');
                Route::get('/{repository}', [RepositoryController::class, 'show'])->name('show');
                Route::post('/upload', [RepositoryController::class, 'upload'])->name('upload')
                    ->middleware('throttle.custom:upload');
                Route::get('/{repository}/file', [RepositoryController::class, 'fileContent'])->name('file')
                    ->middleware('throttle.custom:api');
                Route::get('/{repository}/search', [RepositoryController::class, 'search'])->name('search')
                    ->middleware('throttle.custom:search');
                Route::get('/{repository}/analytics', [RepositoryController::class, 'analytics'])->name('analytics');
                Route::delete('/{repository}', [RepositoryController::class, 'destroy'])->name('destroy');
            });

            // ─── Super Admin ─────────────────────────────────────────────────
            Route::middleware(['role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
                Route::get('/homepage', fn () => Inertia::render('SuperAdmin/Homepage'))->name('homepage');
                Route::get('/credits', fn () => Inertia::render('SuperAdmin/Credits'))->name('credits');
                Route::get('/settings', fn () => Inertia::render('SuperAdmin/Settings'))->name('settings');
                Route::get('/languages', fn () => Inertia::render('SuperAdmin/Languages'))->name('languages');
                Route::get('/admins', fn () => Inertia::render('SuperAdmin/Admins'))->name('admins');
                Route::get('/analytics', fn () => Inertia::render('SuperAdmin/Analytics'))->name('analytics');
            });

            // ─── Admin ───────────────────────────────────────────────────────
            Route::middleware(['role:super_admin,admin', 'throttle.custom:admin'])->prefix('admin')->name('admin.')->group(function () {

                Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');

                // Project review workflow
                Route::get('/projects', fn () => Inertia::render('Admin/Projects/Index'))->name('projects.index');
                Route::get('/projects/pending', [ProjectController::class, 'pendingReview'])->name('projects.pending');
                Route::get('/projects/{project}/review', [ProjectController::class, 'review'])->name('projects.review');
                Route::post('/projects/{project}/approve', [ProjectController::class, 'approve'])->name('projects.approve');
                Route::post('/projects/{project}/reject', [ProjectController::class, 'reject'])->name('projects.reject');
                Route::post('/projects/{project}/revision', [ProjectController::class, 'requestRevision'])->name('projects.revision');
                Route::post('/projects/{project}/publish', [ProjectController::class, 'publish'])->name('projects.publish');
                Route::post('/projects/{project}/archive', [ProjectController::class, 'archive'])->name('projects.archive');

                // Users
                Route::get('/users', fn () => Inertia::render('Admin/Users/Index'))->name('users.index');

                // Categories
                Route::get('/categories', fn () => Inertia::render('Admin/Categories/Index'))->name('categories.index');
                Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
                Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
                Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

                // Competitions
                Route::prefix('competitions')->name('competitions.')->group(function () {
                    Route::get('/', [CompetitionController::class, 'index'])->name('index');
                    Route::post('/', [CompetitionController::class, 'store'])->name('store');
                    Route::put('/{competition}', [CompetitionController::class, 'update'])->name('update');
                    Route::delete('/{competition}', [CompetitionController::class, 'destroy'])->name('destroy');
                    // Project linking
                    Route::get('/{competition}/projects', [CompetitionController::class, 'projects'])->name('projects');
                    Route::post('/{competition}/projects', [CompetitionController::class, 'attachProject'])->name('projects.attach');
                    Route::delete('/{competition}/projects', [CompetitionController::class, 'detachProject'])->name('projects.detach');
                    Route::patch('/{competition}/projects/rank', [CompetitionController::class, 'updateProjectRank'])->name('projects.rank');
                    Route::get('/{competition}/search-projects', [CompetitionController::class, 'searchProjects'])->name('search-projects');
                });

                // Awards
                Route::prefix('awards')->name('awards.')->group(function () {
                    Route::get('/', [AwardController::class, 'index'])->name('index');
                    Route::post('/', [AwardController::class, 'store'])->name('store');
                    Route::put('/{award}', [AwardController::class, 'update'])->name('update');
                    Route::delete('/{award}', [AwardController::class, 'destroy'])->name('destroy');
                    Route::post('/{award}/verify', [AwardController::class, 'verify'])->name('verify');
                });

                // Homepage Builder — Super Admin only
                Route::prefix('homepage-builder')->name('homepage-builder.')->middleware('role:super_admin')->group(function () {
                    Route::get('/', [HomepageBuilderController::class, 'index'])->name('index');
                    Route::post('/draft', [HomepageBuilderController::class, 'saveDraft'])->name('draft');
                    Route::post('/publish', [HomepageBuilderController::class, 'publish'])->name('publish');
                    Route::post('/versions/{version}/restore', [HomepageBuilderController::class, 'restore'])->name('versions.restore');
                    Route::delete('/versions/{version}', [HomepageBuilderController::class, 'destroyVersion'])->name('versions.destroy');
                });

                // Credits — Super Admin only for mutations
                Route::prefix('credits')->name('credits.')->group(function () {
                    Route::get('/', [CreditsController::class, 'index'])->name('index');
                    Route::middleware('role:super_admin')->group(function () {
                        Route::post('/', [CreditsController::class, 'store'])->name('store');
                        Route::put('/{credit}', [CreditsController::class, 'update'])->name('update');
                        Route::delete('/{credit}', [CreditsController::class, 'destroy'])->name('destroy');
                        Route::post('/reorder', [CreditsController::class, 'reorder'])->name('reorder');
                        Route::post('/{credit}/avatar', [CreditsController::class, 'uploadAvatar'])->name('avatar');
                    });
                });
                Route::get('/languages', fn () => Inertia::render('Admin/Languages/Index'))->name('languages.index');

                Route::prefix('settings')->name('settings.')->group(function () {
                    Route::get('/', [SettingsController::class, 'index'])->name('index');
                    Route::post('/group/{group}', [SettingsController::class, 'saveGroup'])->name('group.save');
                    Route::post('/upload-asset', [SettingsController::class, 'uploadAsset'])->name('upload-asset');
                    Route::post('/flush-cache', [SettingsController::class, 'flushCache'])->name('flush-cache');
                });

                Route::get('/analytics', fn () => Inertia::render('Admin/Analytics/Index'))->name('analytics');
                Route::get('/logs', fn () => Inertia::render('Admin/Logs/Index'))->name('logs.index');

                // Technologies
                Route::get('/technologies', [TechnologyController::class, 'index'])->name('technologies.index');
                Route::post('/technologies', [TechnologyController::class, 'store'])->name('technologies.store');
                Route::put('/technologies/{technology}', [TechnologyController::class, 'update'])->name('technologies.update');
                Route::delete('/technologies/{technology}', [TechnologyController::class, 'destroy'])->name('technologies.destroy');
            });

            // ─── Recruiter / Profile / Project Details ───────────────────────
            Route::get('/recruiter', fn () => Inertia::render('RecruiterMode'))->name('recruiter');
            Route::get('/profile/{username}', fn () => Inertia::render('StudentProfile'))->name('student.profile');
            Route::get('/projects/{id}/details', fn () => Inertia::render('ProjectDetails'))->name('project.details');

            // ─── Student ─────────────────────────────────────────────────────
            Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {
                Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
                Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store')
                    ->middleware('throttle.custom:project-write');
                Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
                Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update')
                    ->middleware('throttle.custom:project-write');
                Route::post('/projects/{project}/submit', [ProjectController::class, 'submit'])->name('projects.submit')
                    ->middleware('throttle.custom:project-write');
                Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
                Route::get('/projects/{project}/analytics', ProjectAnalyticsController::class)->name('projects.analytics');
                Route::get('/projects', fn () => Inertia::render('Student/Projects/Index'))->name('projects.index');
                Route::get('/projects/{project}', fn (\App\Models\Project $project) => Inertia::render(
                    'Student/Projects/Show',
                    ['project' => new \App\Http\Resources\ProjectResource($project)]
                ))->name('projects.show');
            });
        });
    });
