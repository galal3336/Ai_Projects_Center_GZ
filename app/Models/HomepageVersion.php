<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomepageVersion extends Model
{
    protected $fillable = ['sections', 'label', 'is_published', 'created_by'];

    protected $casts = [
        'sections'     => 'array',
        'is_published' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
