<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Package;

class PackageImage extends Model
{
    //
    protected $table = 'package_images';
    protected $fillable = [
        'package_id',
        'path'
    ];


    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}
