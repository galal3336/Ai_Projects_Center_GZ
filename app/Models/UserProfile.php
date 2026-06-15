<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'student_id',
        'national_id',
        'phone',
        'gender',
        'birth_date',
        'department',
        'enrollment_year',
        'graduation_year',
        'academic_level',
        'bio',
        'linkedin_url',
        'github_url',
        'website_url',
        'skills',
        'extra',
    ];

    protected $casts = [
        'birth_date'      => 'date',
        'skills'          => 'array',
        'extra'           => 'array',
        'enrollment_year' => 'integer',
        'graduation_year' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
