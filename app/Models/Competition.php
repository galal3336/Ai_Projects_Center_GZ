<?php

namespace App\Models;

use App\Enums\CompetitionStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Competition extends Model
{
    use HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name', 'name_ar', 'slug', 'description', 'description_ar',
        'organizer', 'organizer_logo', 'website_url', 'cover_image',
        'level', 'status', 'start_date', 'end_date', 'academic_year',
        'is_featured', 'sort_order', 'projects_count', 'created_by',
    ];

    protected $casts = [
        'status'      => CompetitionStatus::class,
        'start_date'  => 'date',
        'end_date'    => 'date',
        'is_featured' => 'boolean',
        'sort_order'  => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────────

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'competition_project')
            ->using(CompetitionProject::class)
            ->withPivot(['submission_status', 'award_rank', 'submission_number', 'submitted_at'])
            ->withTimestamps();
    }

    public function awards(): HasMany
    {
        return $this->hasMany(ProjectAward::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ─── Scopes ───────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', CompetitionStatus::Active->value);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    // ─── ActivityLog ──────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['name', 'status', 'level'])->logOnlyDirty();
    }
}
