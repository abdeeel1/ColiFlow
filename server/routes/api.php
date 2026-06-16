<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\FinanceController;
use App\Http\Controllers\Admin\LogisticsController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ValidationController;
use App\Http\Controllers\Cities\CityController;
use App\Http\Controllers\Packages\PackageController;
use App\Http\Controllers\Travels\FavoriteController;
use App\Http\Controllers\Travels\TravelController;
use App\Http\Controllers\Travels\TravelRequestController;
use App\Http\Controllers\Travels\TravelerController;
use App\Http\Controllers\Admin\ReclamationController as AdminReclamationController;
use App\Http\Controllers\User\ReclamationController;
use App\Http\Controllers\User\RatingController;
use App\Http\Controllers\User\ChatController;
use App\Http\Controllers\User\NotificationController;
use App\Http\Controllers\User\ProfileController;
use App\Http\Controllers\User\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    // A banned member is logged out so the SPA drops their session immediately.
    if ($request->user()->status === 'banned') {
        Auth::guard('web')->logout();
        return response()->json(['message' => 'Votre compte a été banni.'], 403);
    }

    return $request->user();
});

Route::get('/cities', [CityController::class, 'index']);

// Public platform config (app name, maintenance, CIN requirement)
Route::get('/app-config', [SettingController::class, 'appConfig']);

// Packages (auth required) — blocked for non-admins during maintenance
Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{package}', [PackageController::class, 'show']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::patch('/packages/{package}', [PackageController::class, 'update']);
    Route::delete('/packages/{package}', [PackageController::class, 'destroy']);
});

// Travels
Route::middleware(['auth:sanctum', 'maintenance'])->post('/travels', [TravelController::class, 'store']);
Route::get('/travels/featured', [TravelController::class, 'featured']);
Route::get('/travels', [TravelController::class, 'index']);
Route::get('/travels/{travel}', [TravelController::class, 'show']);

// Travel Requests
Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::post('/travel-requests', [TravelRequestController::class, 'store']);
    Route::get('/travel-requests', [TravelRequestController::class, 'index']);           // sender: my sent requests
    Route::get('/travel-requests/received', [TravelRequestController::class, 'received']); // traveler: received requests
    Route::patch('/travel-requests/{travelRequest}/status', [TravelRequestController::class, 'updateStatus']);
    Route::post('/travel-requests/{travelRequest}/verify-code', [TravelRequestController::class, 'verifyPickupCode']); // traveler confirms pickup

    // Live location tracking
    Route::post('/travel-requests/{travelRequest}/location', [TravelRequestController::class, 'updateLocation']);   // traveler pushes position
    Route::delete('/travel-requests/{travelRequest}/location', [TravelRequestController::class, 'stopLocation']);   // traveler stops sharing
    Route::get('/travel-requests/{travelRequest}/location', [TravelRequestController::class, 'showLocation']);      // sender reads position
});

// Favorites (auth required)
Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/travels/{travel}/favorite', [FavoriteController::class, 'toggle']);
});

// Profile (auth required)
Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/photo', [ProfileController::class, 'updatePhoto']);
    Route::post('/profile/document', [ProfileController::class, 'updateDocument']);
    Route::patch('/profile/vehicle', [ProfileController::class, 'updateVehicle']);
    Route::post('/profile/vehicle-document', [ProfileController::class, 'updateVehicleDocument']);
});

Route::middleware(['auth:sanctum', 'maintenance'])->post('/switch-role', [UserController::class, 'switchRole']);

// Réclamations (senders & travelers)
Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::get('/reclamations', [ReclamationController::class, 'index']);
    Route::get('/reclamations/eligible', [ReclamationController::class, 'eligible']);
    Route::post('/reclamations', [ReclamationController::class, 'store']);
});

// Évaluations / Ratings (senders rate travelers & vice-versa)
Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::get('/ratings/pending', [RatingController::class, 'pending']);
    Route::get('/ratings/given', [RatingController::class, 'given']);
    Route::get('/ratings/received', [RatingController::class, 'received']);
    Route::post('/ratings', [RatingController::class, 'store']);
});

// Admin dashboard (admin role required)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);

    // Validation center
    Route::get('/admin/validations', [ValidationController::class, 'index']);
    Route::patch('/admin/validations/bulk', [ValidationController::class, 'bulk']);
    Route::get('/admin/validations/{user}', [ValidationController::class, 'show']);
    Route::patch('/admin/validations/{user}/approve', [ValidationController::class, 'approve']);
    Route::patch('/admin/validations/{user}/reject', [ValidationController::class, 'reject']);

    // Member management ("Gestion des Membres")
    Route::get('/admin/members', [MemberController::class, 'index']);
    Route::post('/admin/members', [MemberController::class, 'storeAdmin']);
    Route::patch('/admin/members/{user}/role', [MemberController::class, 'updateRole']);
    Route::patch('/admin/members/{user}/status', [MemberController::class, 'updateStatus']);
    Route::delete('/admin/members/{user}', [MemberController::class, 'destroy']);

    // Logistique Globale (trajets en circulation + suivi des livraisons)
    Route::get('/admin/logistics/travels', [LogisticsController::class, 'travels']);
    Route::patch('/admin/logistics/travels/{travel}', [LogisticsController::class, 'updateTravel']);
    Route::delete('/admin/logistics/travels/{travel}', [LogisticsController::class, 'destroyTravel']);
    Route::get('/admin/logistics/packages', [LogisticsController::class, 'packages']);
    Route::patch('/admin/logistics/packages/{package}', [LogisticsController::class, 'updatePackage']);
    Route::delete('/admin/logistics/packages/{package}', [LogisticsController::class, 'destroyPackage']);

    // Finances & Commissions
    Route::get('/admin/finance/commissions', [FinanceController::class, 'commissions']);

    // Configuration Système (paramètres généraux)
    Route::get('/admin/settings', [SettingController::class, 'index']);
    Route::put('/admin/settings', [SettingController::class, 'update']);

    // Réclamations (gestion des litiges)
    Route::get('/admin/reclamations', [AdminReclamationController::class, 'index']);
    Route::patch('/admin/reclamations/{reclamation}', [AdminReclamationController::class, 'update']);
});

// Traveler dashboard
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/traveler/dashboard', [TravelerController::class, 'dashboard']);
    Route::get('/traveler/travels',   [TravelerController::class, 'travels']);
    Route::get('/traveler/gains',     [TravelerController::class, 'gains']);
    Route::patch('/traveler/travels/{travel}',  [TravelerController::class, 'update']);
    Route::delete('/traveler/travels/{travel}', [TravelerController::class, 'destroy']);
});

// Notifications (auth required) — read-all must come before {id} to avoid routing conflict
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
});

// Messagerie / Chat (auth required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/conversations', [ChatController::class, 'conversations']);
    Route::get('/messages/unread-count', [ChatController::class, 'unreadCount']);
    Route::get('/messages/{userId}', [ChatController::class, 'messages']);
    Route::post('/messages', [ChatController::class, 'store']);
    Route::patch('/messages/{message}', [ChatController::class, 'update']);
    Route::delete('/messages/{message}', [ChatController::class, 'destroy']);
});