<?php

namespace App\Notifications\Project;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectPublishedNotification extends Notification implements ShouldQueue
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
            ->subject('Your Project is Now Live — ' . $this->project->title)
            ->greeting('Congratulations, ' . $notifiable->name . '!')
            ->line("Your project \"{$this->project->title}\" is now publicly available on the platform.")
            ->action('View Live Project', route('projects.show', [
                'locale' => $locale,
                'slug'   => $this->project->slug,
            ]))
            ->line('Share it with your network!');
    }

    public function toArray(object $notifiable): array
    {
        $locale = $notifiable->locale ?? config('app.locale', 'en');

        return [
            'category'     => 'project',
            'title'        => 'Project Published',
            'title_ar'     => 'تم نشر المشروع',
            'body'         => "Your project \"{$this->project->title}\" is now live on the platform.",
            'body_ar'      => "مشروعك \"{$this->project->title_ar}\" متاح الآن على المنصة.",
            'project_id'   => $this->project->id,
            'action_url'   => route('projects.show', [
                'locale' => $locale,
                'slug'   => $this->project->slug,
            ]),
            'icon'         => 'globe',
            'color'        => '#3b82f6',
            'priority'     => 'normal',
        ];
    }
}
