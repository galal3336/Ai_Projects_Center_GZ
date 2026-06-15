<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Technology extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'slug', 'type', 'icon_url', 'color',
        'website_url', 'usage_count', 'is_active',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'usage_count' => 'integer',
    ];

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_technologies')
            ->withPivot(['is_primary', 'sort_order'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }
}
