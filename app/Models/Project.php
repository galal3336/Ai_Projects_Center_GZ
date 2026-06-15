<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use App\Enums\ProjectVisibility;
use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Project extends Model implements HasMedia
{
    use HasUuids, SoftDeletes, LogsActivity, InteractsWithMedia, HasTranslations;

    protected $fillable = [
        'owner_id', 'category_id', 'competition_id',
        'title', 'title_ar', 'slug', 'abstract', 'abstract_ar',
        'description', 'description_ar', 'thumbnail',
        'department', 'academic_year', 'academic_level',
        'supervisor_name', 'supervisor_email', 'course_name',
        'status', 'visibility', 'is_featured',
        'allow_comments', 'allow_downloads',
        'reviewed_by', 'reviewed_at', 'rejection_notes',
        'published_at', 'submitted_at',
        'views_count', 'downloads_count', 'likes_count',
        'stars_count', 'bookmarks_count', 'followers_count',
        'shares_count', 'comments_count', 'members_count',
        'images_count', 'files_count', 'versions_count',
        'average_rating', 'ratings_count', 'trending_score',
        'seo_title', 'seo_description', 'seo_keywords',
        'tags', 'meta',
    ];

    protected $hidden = ['supervisor_email'];

    protected $casts = [
        'status'          => ProjectStatus::class,
        'visibility'      => ProjectVisibility::class,
        'is_featured'     => 'boolean',
        'allow_comments'  => 'boolean',
        'allow_downloads' => 'boolean',
        'reviewed_at'     => 'datetime',
        'published_at'    => 'datetime',
        'submitted_at'    => 'datetime',
        'tags'            => 'array',
        'seo_keywords'    => 'array',
        'meta'            => 'array',
        'average_rating'  => 'decimal:2',
    ];

    // ─── Relationships ────────────────────────────────────────────────

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function competitions(): BelongsToMany
    {
        return $this->belongsToMany(Competition::class, 'competition_project')
            ->using(CompetitionProject::class)
            ->withPivot(['submission_status', 'award_rank', 'submission_number', 'submitted_at'])
            ->withTimestamps();
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order');
    }

    public function coverImage(): HasOne
    {
        return $this->hasOne(ProjectImage::class)->where('is_cover', true);
    }

    public function files(): HasMany
    {
        return $this->hasMany(ProjectFile::class)->orderBy('sort_order');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class)->orderBy('sort_order');
    }

    public function leader(): HasOne
    {
        return $this->hasOne(ProjectMember::class)->where('role', 'leader');
    }

    public function technologies(): BelongsToMany
    {
        return $this->belongsToMany(Technology::class, 'project_technologies')
            ->withPivot(['is_primary', 'sort_order'])
            ->withTimestamps()
            ->orderByPivot('sort_order');
    }

    public function links(): HasMany
    {
        return $this->hasMany(ProjectLink::class)->orderBy('sort_order');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(ProjectVersion::class)->latest('released_at');
    }

    public function latestVersion(): HasOne
    {
        return $this->hasOne(ProjectVersion::class)->where('is_latest', true);
    }

    public function languages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'project_languages')
            ->withPivot('usage')
            ->withTimestamps();
    }

    public function awards(): HasMany
    {
        return $this->hasMany(ProjectAward::class)->latest('awarded_at');
    }

    public function aiResults(): HasMany
    {
        return $this->hasMany(AiResult::class);
    }

    public function stars(): HasMany
    {
        return $this->hasMany(ProjectStar::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(ProjectBookmark::class);
    }

    public function followers(): HasMany
    {
        return $this->hasMany(ProjectFollower::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(ProjectView::class);
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    public function scopePublished(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', ProjectStatus::Published->value);
    }

    public function scopePublic(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('visibility', ProjectVisibility::Public->value);
    }

    public function scopeFeatured(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeForOwner(\Illuminate\Database\Eloquent\Builder $query, int $userId): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('owner_id', $userId);
    }

    public function scopeInCategory(\Illuminate\Database\Eloquent\Builder $query, string $categoryId): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopePendingReview(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->whereIn('status', ProjectStatus::reviewable());
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    public function isOwnedBy(User $user): bool
    {
        return $this->owner_id === $user->id;
    }

    public function isMember(User $user): bool
    {
        if ($this->relationLoaded('members')) {
            return $this->members->contains('user_id', $user->id);
        }

        return $this->members()->where('user_id', $user->id)->exists();
    }

    public function isStarredBy(User $user): bool
    {
        if ($this->relationLoaded('stars')) {
            return $this->stars->contains('user_id', $user->id);
        }

        return $this->stars()->where('user_id', $user->id)->exists();
    }

    public function isBookmarkedBy(User $user): bool
    {
        if ($this->relationLoaded('bookmarks')) {
            return $this->bookmarks->contains('user_id', $user->id);
        }

        return $this->bookmarks()->where('user_id', $user->id)->exists();
    }

    public function isFollowedBy(User $user): bool
    {
        if ($this->relationLoaded('followers')) {
            return $this->followers->contains('user_id', $user->id);
        }

        return $this->followers()->where('user_id', $user->id)->exists();
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    /**
     * Eager-load the minimal user-interaction pivot rows for the authenticated
     * user so that isStarredBy / isBookmarkedBy / isFollowedBy never hit the DB
     * on a list page (prevents N+1 on 20-item pages → 60 extra queries).
     */
    public function scopeWithUserInteractions(\Illuminate\Database\Eloquent\Builder $query, int $userId): \Illuminate\Database\Eloquent\Builder
    {
        return $query
            ->with([
                'stars'     => fn ($q) => $q->where('user_id', $userId)->select(['project_id', 'user_id']),
                'bookmarks' => fn ($q) => $q->where('user_id', $userId)->select(['project_id', 'user_id']),
                'followers' => fn ($q) => $q->where('user_id', $userId)->select(['project_id', 'user_id']),
            ]);
    }

    // ─── Media ────────────────────────────────────────────────────────

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumbnail')->singleFile();
        $this->addMediaCollection('gallery');
        $this->addMediaCollection('files');
    }

    public function registerMediaConversions(?\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        // Thumbnail: card (400×300 WebP), hero (1200×630 WebP)
        $this->addMediaConversion('card')
            ->width(400)
            ->height(300)
            ->format('webp')
            ->quality(80)
            ->withResponsiveImages()
            ->performOnCollections('thumbnail', 'gallery')
            ->nonQueued();

        $this->addMediaConversion('hero')
            ->width(1200)
            ->height(630)
            ->format('webp')
            ->quality(85)
            ->performOnCollections('thumbnail')
            ->queued();

        // Gallery: medium preview (800px wide WebP)
        $this->addMediaConversion('preview')
            ->width(800)
            ->format('webp')
            ->quality(80)
            ->performOnCollections('gallery')
            ->queued();

        // Tiny placeholder for blur-up lazy loading (32px wide WebP)
        $this->addMediaConversion('placeholder')
            ->width(32)
            ->format('webp')
            ->quality(40)
            ->blur(5)
            ->performOnCollections('thumbnail', 'gallery')
            ->nonQueued();
    }

    // ─── ActivityLog ──────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'visibility', 'is_featured', 'reviewed_by'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
