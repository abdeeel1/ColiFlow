<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Config;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        $url = $this->resetUrl($notifiable);

        $expire = Config::get('auth.passwords.'.Config::get('auth.defaults.passwords').'.expire', 60);

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe — ColiFlow')
            ->view('emails.reset-password', [
                'name'   => $notifiable->first_name ?? $notifiable->name ?? 'cher utilisateur',
                'url'    => $url,
                'expire' => $expire,
            ]);
    }
}
