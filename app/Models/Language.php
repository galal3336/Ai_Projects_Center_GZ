<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Language extends Model
{
    use HasUuids;

    protected $fillable = [
        'name', 'name_native', 'code', 'flag_emoji', 'is_rtl', 'is_active',
    ];

    protected $casts = [
        'is_rtl'    => 'boolean',
        'is_active' => 'boolean',
    ];

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_languages')
            ->withPivot('usage')
            ->withTimestamps();
    }
}
