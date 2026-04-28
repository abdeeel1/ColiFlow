<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Travel;

class TravelImage extends Model
{
    //
    protected $fillable = [
    'travel_id',
    'path'
    ];

    public function travel(){
        return $this->belongsTo(Travel::class);
    }
}
