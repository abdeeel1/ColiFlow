<?php

use App\Http\Controllers\Cities\CityController;
use App\Http\Controllers\Packages\PackageController;
use App\Http\Controllers\Travels\FavoriteController;
use App\Http\Controllers\Travels\TravelController;
use App\Http\Controllers\Travels\TravelRequestController;
use App\Http\Controllers\Travels\TravelerController;
use App\Http\Controllers\User\NotificationController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/cities', [CityController::class, 'index']);

// Packages (auth required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::delete('/packages/{package}', [PackageController::class, 'destroy']);
});

// Travels
Route::middleware('auth:sanctum')->post('/travels', [TravelController::class, 'store']);
Route::get('/travels/featured', [TravelController::class, 'featured']);
Route::get('/travels', [TravelController::class, 'index']);
Route::get('/travels/{travel}', [TravelController::class, 'show']);

// Travel Requests
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/travel-requests', [TravelRequestController::class, 'store']);
    Route::get('/travel-requests', [TravelRequestController::class, 'index']);           // sender: my sent requests
    Route::get('/travel-requests/received', [TravelRequestController::class, 'received']); // traveler: received requests
    Route::patch('/travel-requests/{travelRequest}/status', [TravelRequestController::class, 'updateStatus']);
});

// Favorites (auth required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/travels/{travel}/favorite', [FavoriteController::class, 'toggle']);
});

// Profile (auth required)
Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
    Route::post('/profile/document', [ProfileController::class, 'updateDocument']);
    Route::patch('/profile/vehicle', [ProfileController::class, 'updateVehicle']);
    Route::post('/profile/vehicle-document', [ProfileController::class, 'updateVehicleDocument']);
});

Route::middleware('auth:sanctum')->post('/switch-role', [UserController::class, 'switchRole']);

// Traveler dashboard
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/traveler/dashboard', [TravelerController::class, 'dashboard']);
    Route::get('/traveler/travels',   [TravelerController::class, 'travels']);
    Route::get('/traveler/gains',     [TravelerController::class, 'gains']);
    Route::delete('/traveler/travels/{travel}', [TravelerController::class, 'destroy']);
});

// Notifications (auth required) — read-all must come before {id} to avoid routing conflict
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});