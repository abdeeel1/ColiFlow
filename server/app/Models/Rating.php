<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * A star rating (1–5) left after a completed delivery: a sender rates the
 * traveler who carried their colis, and a traveler rates the sender.
 */
class Rating extends Model
{
    protected $table = 'ratings';

    protected $fillable = [
        'travel_request_id',
        'rater_id',
        'ratee_id',
        'role',
        'stars',
        'comment',
    ];

    protected $casts = [
        'stars' => 'integer',
    ];

    public function rater()
    {
        return $this->belongsTo(User::class, 'rater_id');
    }

    public function ratee()
    {
        return $this->belongsTo(User::class, 'ratee_id');
    }

    public function travelRequest()
    {
        return $this->belongsTo(TravelRequest::class);
    }
}
