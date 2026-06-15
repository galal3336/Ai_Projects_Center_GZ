<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class CreditsMember extends Model
{
    use HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'user_id', 'name', 'name_ar', 'title', 'title_ar',
        'bio', 'bio_ar', 'avatar', 'email',
        'linkedin_url', 'github_url', 'website_url',
        'type', 'category', 'contribution_year',
        'is_active', 'is_featured', 'sort_order',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'name_ar', 'title', 'title_ar', 'type', 'category',
                       'is_active', 'is_featured', 'sort_order', 'contribution_year'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "CreditsMember {$eventName}");
    }

    protected $casts = [
        'is_active'   => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
