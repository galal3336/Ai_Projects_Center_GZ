<?php

namespace App\Services\Activity;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;

class ActivityService
{
    public function log(
        string $event,
        string $description,
        ?Model $subject = null,
        ?Model $causer = null,
        array $properties = [],
    ): Activity {
        $logger = activity()
            ->causedBy($causer ?? Auth::user())
            ->withProperties($properties)
            ->event($event);

        if ($subject) {
            $logger->performedOn($subject);
        }

        return $logger->log($description);
    }

    public function logAuth(string $event, ?Model $user = null): Activity
    {
        return $this->log(
            event:       $event,
            description: "User {$event}",
            causer:      $user ?? Auth::user(),
            properties:  ['ip' => request()->ip(), 'user_agent' => request()->userAgent()],
        );
    }

    public function getForSubject(Model $subject, int $limit = 50)
    {
        return Activity::forSubject($subject)->latest()->limit($limit)->get();
    }

    public function getForCauser(Model $causer, int $limit = 50)
    {
        return Activity::causedBy($causer)->latest()->limit($limit)->get();
    }
}
