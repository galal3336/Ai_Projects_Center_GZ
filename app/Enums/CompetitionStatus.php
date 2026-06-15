<?php

namespace App\Enums;

enum CompetitionStatus: string
{
    case Upcoming  = 'upcoming';
    case Active    = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Upcoming  => 'Upcoming',
            self::Active    => 'Active',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    public function acceptsSubmissions(): bool
    {
        return $this === self::Active;
    }
}
