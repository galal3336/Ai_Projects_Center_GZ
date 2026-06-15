<?php

namespace App\Enums;

enum ProjectVisibility: string
{
    case Public     = 'public';
    case University = 'university';
    case Private    = 'private';

    public function label(): string
    {
        return match($this) {
            self::Public     => 'Public',
            self::University => 'University Only',
            self::Private    => 'Private',
        };
    }
}
