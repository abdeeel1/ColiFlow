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