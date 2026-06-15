<?php

namespace App\Enums;

enum ProjectFileType: string
{
    case Report        = 'report';
    case Presentation  = 'presentation';
    case SourceCode    = 'source_code';
    case Dataset       = 'dataset';
    case Model         = 'model';
    case DemoVideo     = 'demo_video';
    case Documentation = 'documentation';
    case Other         = 'other';

    public function label(): string
    {
        return match($this) {
            self::Report        => 'Report',
            self::Presentation  => 'Presentation',
            self::SourceCode    => 'Source Code',
            self::Dataset       => 'Dataset',
            self::Model         => 'ML Model',
            self::DemoVideo     => 'Demo Video',
            self::Documentation => 'Documentation',
            self::Other         => 'Other',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::Report        => 'file-text',
            self::Presentation  => 'presentation',
            self::SourceCode    => 'code-2',
            self::Dataset       => 'database',
            self::Model         => 'brain-circuit',
            self::DemoVideo     => 'video',
            self::Documentation => 'book-open',
            self::Other         => 'file',
        };
    }
}
