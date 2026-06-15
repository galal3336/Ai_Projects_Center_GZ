<?php

namespace App\Enums;

enum ProjectMemberRole: string
{
    case Leader      = 'leader';
    case Member      = 'member';
    case Supervisor  = 'supervisor';
    case CoSupervisor = 'co_supervisor';
    case External    = 'external';

    public function label(): string
    {
        return match($this) {
            self::Leader       => 'Project Leader',
            self::Member       => 'Team Member',
            self::Supervisor   => 'Supervisor',
            self::CoSupervisor => 'Co-Supervisor',
            self::External     => 'External Collaborator',
        };
    }
}
