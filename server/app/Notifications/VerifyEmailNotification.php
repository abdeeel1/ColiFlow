<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $expire = Config::get('auth.verification.expire', 60);

        $url = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes($expire),
            [
                'id'   => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        return (new MailMessage)
            ->subject('Vérifiez votre adresse email — ColiFlow')
            ->view('emails.verify-email', [
                'name'   => $notifiable->first_name ?? $notifiable->name ?? 'cher utilisateur',
                'url'    => $url,
                'expire' => $expire,
            ]);
    }
}
