<?php

use App\Http\Controllers\Admin\HomepageBuilderController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\FollowerController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RepositoryController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\StarController;
use App\Http\Controllers\Student\ProjectAnalyticsController;
use App\Http\Controllers\TechnologyController;
use App\Http\Controllers\TrendingController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes — AIKFS
|--------------------------------------------------------------------------
*/

// ─── Public (Visitor + all roles) ────────────────────────────────────────────
Route::get('/', fn () => Inertia::render('Welcome'))->name('home');

Route::get('/hall-of-fame', fn () => Inertia::render('HallOfFame'))->name('hall-of-fame');

Route::get('/locale/{locale}', function (string $locale) {
    $supported = explode(',', config('app.supported_locales', 'en,ar'));
    if (in_array($locale, $supported)) {
        session(['locale' => $locale]);
    }
    return back();
})->name('locale.switch');

// Public project browsing — view_public_content
Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
Route::get('/projects/{slug}', [ProjectController::class, 'show'])->name('projects.show');

// API helpers (no auth required — read-only reference data)
Route::get('/api/categories', [CategoryController::class, 'apiList'])->name('api.categories');
Route::get('/api/technologies', [TechnologyController::class, 'apiList'])->name('api.technologies');

// Search
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/api/search/suggest', [SearchController::class, 'suggest'])->name('api.search.suggest');

// Trending
Route::get('/trending', [TrendingController::class, 'index'])->name('trending');
Route::get('/api/trending', [TrendingController::class, 'api'])->name('api.trending');

// ─── Authenticated ────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', fn () => Inertia::render('Dashboard'))->name('dashboard');

    // ─── Stars ───────────────────────────────────────────────────────────────────
    Route::post('/projects/{project}/star', [StarController::class, 'toggle'])->name('projects.star');
    Route::get('/me/stars', [StarController::class, 'index'])->name('me.stars');

    // ─── Bookmarks ───────────────────────────────────────────────────────────────
    Route::post('/projects/{project}/bookmark', [BookmarkController::class, 'toggle'])->name('projects.bookmark');
    Route::get('/me/bookmarks', [BookmarkController::class, 'index'])->name('me.bookmarks');

    // ─── Followers ───────────────────────────────────────────────────────────────
    Route::post('/projects/{project}/follow', [FollowerController::class, 'toggle'])->name('projects.follow');
    Route::get('/projects/{project}/followers', [FollowerController::class, 'followers'])->name('projects.followers');
    Route::get('/me/following', [FollowerController::class, 'index'])->name('me.following');

    // ─── Repository Explorer ──────────────────────────────────────────────────
    Route::prefix('repositories')->name('repositories.')->group(function () {
        Route::get('/', [RepositoryController::class, 'index'])->name('index');
        Route::get('/{repository}', [RepositoryController::class, 'show'])->name('show');

        Route::post('/upload', [RepositoryController::class, 'upload'])->name('upload');
        Route::get('/{repository}/file', [RepositoryController::class, 'fileContent'])->name('file');
        Route::get('/{repository}/search', [RepositoryController::class, 'search'])->name('search');
        Route::get('/{repository}/analytics', [RepositoryController::class, 'analytics'])->name('analytics');
        Route::delete('/{repository}', [RepositoryController::class, 'destroy'])->name('destroy');
    });

    // ─── Super Admin (full access + exclusive permissions) ────────────────────
    Route::middleware(['role:super_admin'])->prefix('super-admin')->name('super-admin.')->group(function () {
        // Manage Homepage
        Route::get('/homepage', fn () => Inertia::render('SuperAdmin/Homepage'))->name('homepage');

        // Manage Credits
        Route::get('/credits', fn () => Inertia::render('SuperAdmin/Credits'))->name('credits');

        // Manage Settings
        Route::get('/settings', fn () => Inertia::render('SuperAdmin/Settings'))->name('settings');

        // Manage Languages
        Route::get('/languages', fn () => Inertia::render('SuperAdmin/Languages'))->name('languages');

        // Manage Admins
        Route::get('/admins', fn () => Inertia::render('SuperAdmin/Admins'))->name('admins');

        // View Analytics (global)
        Route::get('/analytics', fn () => Inertia::render('SuperAdmin/Analytics'))->name('analytics');
    });

    // ─── Admin Dashboard (unified admin panel) ────────────────────────────────
    Route::middleware(['role:super_admin,admin'])->prefix('admin')->name('admin.')->group(function () {

        // Dashboard overview
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

        // Users management
        Route::get('/users', fn () => Inertia::render('Admin/Users/Index'))->name('users.index');

        // Manage Categories
        Route::get('/categories', fn () => Inertia::render('Admin/Categories/Index'))->name('categories.index');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Competitions
        Route::get('/competitions', fn () => Inertia::render('Admin/Competitions/Index'))->name('competitions.index');

        // Awards
        Route::get('/awards', fn () => Inertia::render('Admin/Awards/Index'))->name('awards.index');

        // Homepage Builder — Super Admin only
        Route::prefix('homepage-builder')->name('homepage-builder.')->middleware('role:super_admin')->group(function () {
            Route::get('/', [HomepageBuilderController::class, 'index'])->name('index');
            Route::post('/draft', [HomepageBuilderController::class, 'saveDraft'])->name('draft');
            Route::post('/publish', [HomepageBuilderController::class, 'publish'])->name('publish');
            Route::post('/versions/{version}/restore', [HomepageBuilderController::class, 'restore'])->name('versions.restore');
            Route::delete('/versions/{version}', [HomepageBuilderController::class, 'destroyVersion'])->name('versions.destroy');
        });

        // Credits Management
        Route::get('/credits', fn () => Inertia::render('Admin/Credits/Index'))->name('credits.index');

        // Languages
        Route::get('/languages', fn () => Inertia::render('Admin/Languages/Index'))->name('languages.index');

        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::post('/group/{group}', [SettingsController::class, 'saveGroup'])->name('group.save');
            Route::post('/upload-asset', [SettingsController::class, 'uploadAsset'])->name('upload-asset');
            Route::post('/flush-cache', [SettingsController::class, 'flushCache'])->name('flush-cache');
        });

        // Analytics
        Route::get('/analytics', fn () => Inertia::render('Admin/Analytics/Index'))->name('analytics');

        // Logs
        Route::get('/logs', fn () => Inertia::render('Admin/Logs/Index'))->name('logs.index');

        // Manage Technologies (kept from original)
        Route::get('/technologies', [TechnologyController::class, 'index'])->name('technologies.index');
        Route::post('/technologies', [TechnologyController::class, 'store'])->name('technologies.store');
        Route::put('/technologies/{technology}', [TechnologyController::class, 'update'])->name('technologies.update');
        Route::delete('/technologies/{technology}', [TechnologyController::class, 'destroy'])->name('technologies.destroy');
    });

    // ─── Recruiter Mode ──────────────────────────────────────────────────────
    Route::get('/recruiter', fn () => Inertia::render('RecruiterMode'))->name('recruiter');

    // ─── Student Profile ─────────────────────────────────────────────────────
    Route::get('/profile/{username}', fn () => Inertia::render('StudentProfile'))->name('student.profile');

    // ─── Project Details ──────────────────────────────────────────────────────
    Route::get('/projects/{id}/details', fn () => Inertia::render('ProjectDetails'))->name('project.details');

    // ─── Student (create/edit own projects, submit, view own analytics) ───────
    Route::middleware(['role:student'])->prefix('student')->name('student.')->group(function () {

        // Create Projects
        Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
        Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');

        // Edit Own Projects
        Route::get('/projects/{project}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
        Route::put('/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');

        // Submit Projects
        Route::post('/projects/{project}/submit', [ProjectController::class, 'submit'])->name('projects.submit');

        // Delete own draft projects
        Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');

        // View Analytics For Own Projects
        Route::get('/projects/{project}/analytics', ProjectAnalyticsController::class)->name('projects.analytics');

        // Project index & show
        Route::get('/projects', fn () => Inertia::render('Student/Projects/Index'))->name('projects.index');
        Route::get('/projects/{project}', fn (\App\Models\Project $project) => Inertia::render(
            'Student/Projects/Show',
            ['project' => new \App\Http\Resources\ProjectResource($project)]
        ))->name('projects.show');
    });
});
