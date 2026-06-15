<?php

namespace App\Models;

use App\Enums\ProjectMemberRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMember extends Model
{
    use HasUuids;

    protected $fillable = [
        'project_id', 'user_id', 'name', 'email', 'student_id',
        'role', 'contribution', 'contribution_ar', 'avatar',
        'linkedin_url', 'github_url', 'is_confirmed', 'sort_order',
    ];

    protected $casts = [
        'role'         => ProjectMemberRole::class,
        'is_confirmed' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isLeader(): bool
    {
        return $this->role === ProjectMemberRole::Leader;
    }
}
