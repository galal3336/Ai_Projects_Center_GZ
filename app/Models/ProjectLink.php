<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectLink extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id', 'type', 'label', 'label_ar',
        'url', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'sort_order' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function icon(): string
    {
        return match($this->type) {
            'github'        => 'github',
            'gitlab'        => 'gitlab',
            'demo'          => 'external-link',
            'video'         => 'youtube',
            'paper'         => 'file-text',
            'figma'         => 'figma',
            'huggingface'   => 'bot',
            'kaggle'        => 'database',
            'playstore'     => 'smartphone',
            'appstore'      => 'smartphone',
            'website'       => 'globe',
            'documentation' => 'book-open',
            default         => 'link',
        };
    }
}
