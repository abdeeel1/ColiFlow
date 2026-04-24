<?php

use App\Http\Controllers\Api\Auth\AuthController as AuthAuthController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

