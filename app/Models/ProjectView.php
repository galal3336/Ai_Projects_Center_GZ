<?php

namespace App\Models;

use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectView extends Model
{
    use MassPrunable;

    public $timestamps = false;

    protected $fillable = ['project_id', 'user_id', 'ip_hash', 'referrer', 'country', 'browser', 'viewed_at'];

    public function prunable(): \Illuminate\Database\Eloquent\Builder
    {
        return static::where('viewed_at', '<', now()->subYear());
    }

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
