<?php

use App\Http\Controllers\Cities\CityController;
use App\Http\Controllers\Packages\PackageController;
use App\Http\Controllers\User\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/cities', [CityController::class, 'index']);

Route::middleware('auth:sanctum')->post('/packages', [PackageController::class, 'store']);

Route::middleware('auth:sanctum')->post('/switch-role', [UserController::class, 'switchRole']);