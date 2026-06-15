<?php

namespace App\Providers;

use App\Events\Project\ProjectApproved;
use App\Events\Project\ProjectArchived;
use App\Events\Project\ProjectPublished;
use App\Events\Project\ProjectRejected;
use App\Events\Project\ProjectRevisionRequested;
use App\Events\Project\ProjectSubmitted;
use App\Listeners\Project\NotifyAdminsOnProjectSubmitted;
use App\Listeners\Project\NotifyOwnerOnProjectApproved;
use App\Listeners\Project\NotifyOwnerOnProjectPublished;
use App\Listeners\Project\NotifyOwnerOnProjectRejected;
use App\Listeners\Project\NotifyOwnerOnRevisionRequested;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        ProjectSubmitted::class => [
            NotifyAdminsOnProjectSubmitted::class,
        ],

        ProjectApproved::class => [
            NotifyOwnerOnProjectApproved::class,
        ],

        ProjectRejected::class => [
            NotifyOwnerOnProjectRejected::class,
        ],

        ProjectRevisionRequested::class => [
            NotifyOwnerOnRevisionRequested::class,
        ],

        ProjectPublished::class => [
            NotifyOwnerOnProjectPublished::class,
        ],

        ProjectArchived::class => [],
    ];
}
