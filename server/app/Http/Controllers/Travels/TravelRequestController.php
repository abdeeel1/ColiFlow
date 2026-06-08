<?php

namespace App\Http\Controllers\Travels;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Travel;
use App\Models\TravelRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TravelRequestController extends Controller
{
    /**
     * Send a package on a travel (sender action).
     */
    public function store(Request $request)
    {
        $request->validate([
            'travel_id'  => 'required|exists:travels,id',
            'package_id' => 'required|exists:packages,id',
            'message'    => 'nullable|string|max:500',
        ]);

        $user    = Auth::user();
        $package = Package::findOrFail($request->package_id);
        $travel  = Travel::findOrFail($request->travel_id);

        // Package must belong to sender
        if ($package->user_id !== $user->id) {
            return response()->json(['message' => 'Ce colis ne vous appartient pas.'], 403);
        }

        // Traveler cannot send on their own travel
        if ($travel->user_id === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas envoyer sur votre propre trajet.'], 422);
        }

        // Check already requested
        $existing = TravelRequest::where('travel_id', $travel->id)
            ->where('package_id', $package->id)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Vous avez déjà soumis une demande pour ce colis sur ce trajet.',
                'travel_request' => $existing,
            ], 409);
        }

        $travelRequest = TravelRequest::create([
            'travel_id'  => $travel->id,
            'package_id' => $package->id,
            'sender_id'  => $user->id,
            'status'     => 'pending',
            'message'    => $request->message,
        ]);

        return response()->json([
            'message'        => 'Demande envoyée avec succès !',
            'travel_request' => $travelRequest->load(['travel', 'package']),
        ], 201);
    }

    /**
     * List sender's own requests.
     */
    public function index()
    {
        $requests = TravelRequest::where('sender_id', Auth::id())
            ->with(['travel.from_city', 'travel.to_city', 'package'])
            ->latest()
            ->get();

        return response()->json($requests);
    }

    /**
     * Traveler accepts or rejects a request.
     */
    public function updateStatus(Request $request, TravelRequest $travelRequest)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        // Only the traveler of that travel can update
        if ($travelRequest->travel->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $travelRequest->update(['status' => $request->status]);

        return response()->json([
            'message'        => $request->status === 'accepted' ? 'Demande acceptée.' : 'Demande refusée.',
            'travel_request' => $travelRequest,
        ]);
    }

    /**
     * Requests received by traveler (for traveler dashboard).
     */
    public function received()
    {
        $requests = TravelRequest::whereHas('travel', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->with(['travel.from_city', 'travel.to_city', 'package', 'sender'])
            ->latest()
            ->get();

        return response()->json($requests);
    }
}