<?php

namespace App\Mail;

use App\Models\TravelRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PickupCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public TravelRequest $travelRequest)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre code de remise ColiFlow',
        );
    }

    public function content(): Content
    {
        $tr = $this->travelRequest;

        return new Content(
            view: 'emails.pickup-code',
            with: [
                'senderName'   => $tr->sender->first_name
                    ?? $tr->sender->name
                    ?? 'Expéditeur',
                'packageName'  => $tr->package->package_name ?? 'votre colis',
                'travelerName' => $tr->travel->user->first_name
                    ?? $tr->travel->user->name
                    ?? 'le voyageur',
                'code'         => $tr->pickup_code,
            ],
        );
    }
}
