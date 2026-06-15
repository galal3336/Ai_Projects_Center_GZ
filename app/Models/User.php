<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail, HasMedia
{
    use HasFactory,
        Notifiable,
        HasRoles,
        SoftDeletes,
        LogsActivity,
        InteractsWithMedia;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'status',
        'locale',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'        => 'datetime',
            'password'                  => 'hashed',
            'status'                    => UserStatus::class,
            'two_factor_confirmed_at'   => 'datetime',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function projects(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function projectMemberships(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function creditsMember(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(CreditsMember::class);
    }

    public function starredProjects(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectStar::class);
    }

    public function bookmarkedProjects(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectBookmark::class);
    }

    public function followedProjects(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProjectFollower::class);
    }

    // ─── Spatie ActivityLog ───────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'username', 'status', 'locale'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // ─── Spatie MediaLibrary ──────────────────────────────────────────

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(UserRole::SuperAdmin->value);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::Admin->value);
    }

    public function isStudent(): bool
    {
        return $this->hasRole(UserRole::Student->value);
    }

    public function isVisitor(): bool
    {
        return $this->hasRole(UserRole::Visitor->value);
    }

    public function getPrimaryRole(): ?string
    {
        return $this->roles->first()?->name;
    }
}
