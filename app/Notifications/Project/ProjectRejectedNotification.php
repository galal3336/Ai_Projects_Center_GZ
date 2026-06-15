<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Project $project,
        public readonly string $rejectionNotes,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->locale ?? config('app.locale', 'en');

        return (new MailMessage)
            ->subject('Project Update — ' . $this->project->title)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line("Unfortunately, your project \"{$this->project->title}\" was not approved at this time.")
            ->line("**Reviewer notes:** {$this->rejectionNotes}")
            ->action('Edit Project', route('student.projects.edit', [
                'locale'  => $locale,
                'project' => $this->project->id,
            ]))
            ->line('You are welcome to make changes and resubmit.');
    }

    public function toArray(object $notifiable): array
    {
        $locale = $notifiable->locale ?? config('app.locale', 'en');

        return [
            'category'     => 'review',
            'title'        => 'Project Rejected',
            'title_ar'     => 'تم رفض المشروع',
            'body'         => "Your project \"{$this->project->title}\" was not approved. Notes: {$this->rejectionNotes}",
            'body_ar'      => "لم يتم قبول مشروعك \"{$this->project->title_ar}\". الملاحظات: {$this->rejectionNotes}",
            'project_id'   => $this->project->id,
            'action_url'   => route('student.projects.edit', [
                'locale'  => $locale,
                'project' => $this->project->id,
            ]),
            'icon'         => 'x-circle',
            'color'        => '#ef4444',
            'priority'     => 'high',
        ];
    }
}
