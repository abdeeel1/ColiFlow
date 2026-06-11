<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TravelRequest extends Model
{
    protected $table = 'travel_requests';

    protected $fillable = [
        'travel_id',
        'package_id',
        'sender_id',
        'status',
        'message',
        'pickup_code',
        'picked_up_at',
        'delivered_at',
        'location_sharing',
        'current_lat',
        'current_lng',
        'location_updated_at',
    ];

    protected $casts = [
        'picked_up_at' => 'datetime',
        'delivered_at' => 'datetime',
        'location_sharing' => 'boolean',
        'current_lat' => 'float',
        'current_lng' => 'float',
        'location_updated_at' => 'datetime',
    ];

    public function travel()
    {
        return $this->belongsTo(Travel::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}