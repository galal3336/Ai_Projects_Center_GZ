<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Draft     = 'draft';
    case Pending   = 'pending';
    case Revision  = 'revision';
    case Approved  = 'approved';
    case Published = 'published';
    case Archived  = 'archived';
    case Rejected  = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::Draft     => 'Draft',
            self::Pending   => 'Pending Review',
            self::Revision  => 'Needs Revision',
            self::Approved  => 'Approved',
            self::Published => 'Published',
            self::Archived  => 'Archived',
            self::Rejected  => 'Rejected',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Draft     => 'gray',
            self::Pending   => 'yellow',
            self::Revision  => 'orange',
            self::Approved  => 'blue',
            self::Published => 'green',
            self::Archived  => 'slate',
            self::Rejected  => 'red',
        };
    }

    public function isVisible(): bool
    {
        return $this === self::Published;
    }

    public function canBeEditedByOwner(): bool
    {
        return in_array($this, [self::Draft, self::Revision]);
    }

    public static function reviewable(): array
    {
        return [self::Pending->value, self::Revision->value];
    }
}
