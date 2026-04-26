<?php

use App\Http\Controllers\Auth\GoogleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

Route::post('/complete-profile', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'phone' => ['required', 'regex:/^(\+212|0)[5-7]\d{8}$/']
    ]);

    $user = $request->user();
    $user->phone = $request->phone;
    $user->save();

    return response()->json(['message' => 'Profil complété']);
})->middleware('auth:sanctum');

require __DIR__.'/auth.php';
