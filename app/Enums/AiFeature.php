<?php

namespace App\Enums;

enum AiFeature: string
{
    case Summary = 'summary';
    case Similar = 'similar';
    case Judge   = 'judge';
    case Tags    = 'tags';

    public function label(): string
    {
        return match($this) {
            self::Summary => 'AI Summary',
            self::Similar => 'Similar Projects',
            self::Judge   => 'AI Judge',
            self::Tags    => 'AI Tags',
        };
    }

    /** Queue name — keeps AI jobs on a dedicated worker */
    public function queue(): string
    {
        return 'ai';
    }

    /** Claude timeout per feature in seconds */
    public function timeout(): int
    {
        return match($this) {
            self::Summary => 120,
            self::Similar => 90,
            self::Judge   => 180,
            self::Tags    => 60,
        };
    }
}
