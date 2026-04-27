<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    //
    protected $primaryKey = 'id';
    protected $fillable = [
        'name',
        'postal_code'
    ];
}
