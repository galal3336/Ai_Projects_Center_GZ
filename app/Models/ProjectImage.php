<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectImage extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id', 'path', 'disk', 'original_name',
        'alt_text', 'caption', 'caption_ar',
        'size_bytes', 'width', 'height', 'mime_type',
        'is_cover', 'sort_order', 'uploaded_by',
    ];

    protected $casts = [
        'is_cover'   => 'boolean',
        'sort_order' => 'integer',
        'width'      => 'integer',
        'height'     => 'integer',
        'size_bytes' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getUrlAttribute(): string
    {
        return \Storage::disk($this->disk)->url($this->path);
    }
}
