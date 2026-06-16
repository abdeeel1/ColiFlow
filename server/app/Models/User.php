<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'email',
        'email_verified_at',
        'password',
        'phone',
        'postal_code',
        'city',
        'country',
        'bio',
        'accept',
        'role',
        'is_traveler',
        'profile_picture',
        'document_cin',
        'statut_verification',
        'vehicle_verification',
        'status',
        'identity_rejection_reasons',
        'vehicle_rejection_reasons',
        'google_id',
        'vehicle_type',
        'vehicle_brand_model',
        'vehicle_plate',
        'vehicle_color',
        'vehicle_capacity',
        'vehicle_photo',
        'permis_document',
        'assurance_document',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'identity_rejection_reasons' => 'array',
            'vehicle_rejection_reasons' => 'array',
        ];
    }

    /**
     * Send the branded email verification notification.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }

    /**
     * Send the branded password reset notification.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Réclamations filed by this user.
     */
    public function reclamations()
    {
        return $this->hasMany(\App\Models\Reclamation::class);
    }

    /**
     * Ratings received by this user (as the rated party).
     */
    public function ratingsReceived()
    {
        return $this->hasMany(\App\Models\Rating::class, 'ratee_id');
    }

    /**
     * Average star rating received, rounded to one decimal (null when never rated).
     */
    public function averageRating(): ?float
    {
        $avg = $this->ratingsReceived()->avg('stars');
        return $avg !== null ? round((float) $avg, 1) : null;
    }
}