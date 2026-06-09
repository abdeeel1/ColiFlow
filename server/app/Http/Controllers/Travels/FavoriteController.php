<?php

namespace App\Http\Controllers\Travels;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Travel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    /**
     * List the travels favorited by the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $travels = Travel::query()
            ->whereHas('favorites', fn ($q) => $q->where('user_id', $user->id))
            ->with(['user', 'from_city', 'to_city', 'images'])
            ->latest()
            ->get();

        return response()->json([
            'travels' => $travels,
        ]);
    }

    /**
     * Toggle the favorite status of a travel for the authenticated user.
     */
    public function toggle(Travel $travel)
    {
        $user = Auth::user();

        $favorite = Favorite::where('user_id', $user->id)
            ->where('travel_id', $travel->id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['favorited' => false]);
        }

        Favorite::create([
            'user_id' => $user->id,
            'travel_id' => $travel->id,
        ]);

        return response()->json(['favorited' => true]);
    }
}
