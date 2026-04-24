<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    //
    public function login(LoginUserRequest $request) {
        
        $credentials = $request->validated();
        if(!Auth::attempt($credentials)){
            return response()->json([
                'data' => 'e-mail ou mot de passe incorrecte'
            ], 422);
        }

        return 'welcome';
    }
}
