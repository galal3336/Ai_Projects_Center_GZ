<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectSubmittedAdminNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Project $project) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->locale ?? config('app.locale', 'en');

        return (new MailMessage)
            ->subject('New Project Submission — ' . $this->project->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line("A new project has been submitted for review.")
            ->line("**Project:** {$this->project->title}")
            ->line("**Submitted by:** {$this->project->owner->name}")
            ->action('Review Project', route('admin.projects.review', [
                'locale'  => $locale,
                'project' => $this->project->id,
            ]))
            ->line('Please review and take action.');
    }

    public function toArray(object $notifiable): array
    {
        $locale = $notifiable->locale ?? config('app.locale', 'en');

        return [
            'category'     => 'review',
            'title'        => 'New Project Submission',
            'title_ar'     => 'تقديم مشروع جديد',
            'body'         => "New project awaiting review: \"{$this->project->title}\" by {$this->project->owner->name}.",
            'body_ar'      => "مشروع جديد بانتظار المراجعة: \"{$this->project->title_ar}\" بواسطة {$this->project->owner->name}.",
            'project_id'   => $this->project->id,
            'action_url'   => route('admin.projects.review', [
                'locale'  => $locale,
                'project' => $this->project->id,
            ]),
            'icon'         => 'inbox',
            'color'        => '#6366f1',
            'priority'     => 'normal',
        ];
    }
}
