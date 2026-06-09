<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\City;
use App\Models\TravelImage;

class Travel extends Model
{
    //
    protected $table = "travels";
    protected $fillable = [
        'user_id',
        'from_city_id',
        'to_city_id',
        'departure_date',
        'max_weight',
        'price',
        'car_identifier',
        'car_model',
        'car_type',
        'accepted_categories',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'departure_date' => 'datetime',
        'accepted_categories' => 'array',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function images(){
        return $this->hasMany(TravelImage::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function favorites(){
        return $this->hasMany(Favorite::class);
    }

    public function travelRequests(){
        return $this->hasMany(\App\Models\TravelRequest::class);
    }

    public function from_city(){
        return $this->belongsTo(City::class, 'from_city_id');
    }

    public function to_city(){
        return $this->belongsTo(City::class, 'to_city_id');
    }

    protected static function booted(){
        static::deleting(function ($travel) {
            foreach ($travel->images as $image) {
                Storage::disk('public')->delete($image->path);
            }

            $travel->images()->delete();
        });
    }
}
