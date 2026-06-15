<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectVersion extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id', 'version_tag', 'title', 'changelog', 'changelog_ar',
        'type', 'status', 'is_latest', 'released_at', 'created_by',
    ];

    protected $casts = [
        'is_latest'   => 'boolean',
        'released_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
