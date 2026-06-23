<?php

use App\Http\Controllers\Auth\GoogleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// POST /complete-profile moved to routes/api.php (so it is proxied in production).

// Breeze auth routes (login, register, logout, password reset, email verification)
// are exposed under the /api prefix so the Vercel proxy (which forwards /api/*)
// can reach them in production. Route names (login, register, …) stay unchanged.
Route::prefix('api')->group(__DIR__.'/auth.php');
