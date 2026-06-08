<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\PackageImage;
use Illuminate\Support\Facades\Storage;

class Package extends Model
{
    //
    protected $primaryKey = 'id';
    protected $table = 'packages';
    protected $fillable = [
        'user_id',
        'from_city_id',
        'to_city_id',
        'package_name',
        'category',
        'package_size',
        'description',
        'date_delivery',
        'urgency',
        'price',
        'accept_condition'
    ];

    protected $casts = [
    'date_delivery' => 'datetime',
    'package_size' => 'decimal:2',
    'accept_condition' => 'boolean',
    ];

    public function images()
    {
        return $this->hasMany(PackageImage::class);
    }

    public function from_city()
    {
        return $this->belongsTo(\App\Models\City::class, 'from_city_id');
    }

    public function to_city()
    {
        return $this->belongsTo(\App\Models\City::class, 'to_city_id');
    }

    public function travelRequests()
    {
        return $this->hasMany(\App\Models\TravelRequest::class);
    }

    protected static function booted()
    {
        static::deleting(function ($package) {

            foreach ($package->images as $image) {
                Storage::disk('public')->delete($image->path);
            }

        });
    }
}