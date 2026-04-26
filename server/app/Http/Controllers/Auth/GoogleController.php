<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

use function Symfony\Component\Clock\now;

class GoogleController extends Controller
{
    /**
     * Redirect user to Google
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google callback
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'email_verified_at' => now(),
                    'password' => bcrypt(Str::random(16)),
                    'profile_picture' => $googleUser->getAvatar(),
                ]);
            }else{
                if(!$user->email_verified_at){
                    $user->email_verified_at = now();
                    $user->save();
                }
            }

            Auth::login($user);

            if (! $user->phone) {
                 return redirect(config('app.frontend_url') . '/complete-profile?google=1');
            }

            return redirect(config('app.frontend_url') . '/');

        } catch (\Exception $e) {
            dd($e->getMessage());
        }
    }
}