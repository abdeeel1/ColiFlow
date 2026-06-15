<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        
        $request->authenticate();
        
        $request->session()->regenerate();
        
        /** @var User $user */
        $user = Auth::user();
        
        if($user && !$user->hasVerifiedEmail()){
            Auth::logout();

            return response()->json([
                'message' => 'veuillez vérifier votre email avant de vous connecter'
            ]);
        }

        // Banned members cannot sign in.
        if ($user && $user->status === 'banned') {
            Auth::logout();

            return response()->json([
                'message' => 'Votre compte a été banni. Contactez le support pour plus d\'informations.'
            ], 403);
        }

        return response()->noContent();
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
