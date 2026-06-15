<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAward extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id', 'competition_id', 'title', 'title_ar',
        'issuer', 'issuer_logo', 'rank', 'awarded_at',
        'academic_year', 'certificate_path', 'notes',
        'is_verified', 'verified_by',
    ];

    protected $casts = [
        'awarded_at'  => 'date',
        'is_verified' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
