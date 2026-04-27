<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    //
    public function switchRole(Request $request) {

        $request->validate([
            'is_traveler' => 'required|boolean'
        ]);

        $user = $request->user();

        $user->is_traveler = $request->is_traveler;
        $user->save();
        
        $message = $user->is_traveler
        ? 'vous êtes en mode voyageur'
        : 'vous êtes en mode expéditeur';

        return response()->json([
            'message' => $message,
            'user' => $user
        ]);
    }
}
