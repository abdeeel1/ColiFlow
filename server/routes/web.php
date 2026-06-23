<?php

use App\Http\Controllers\Auth\GoogleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);

// POST /complete-profile moved to routes/api.php (so it is proxied in production).

require __DIR__.'/auth.php';
