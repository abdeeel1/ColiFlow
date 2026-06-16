<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Rating;
use App\Models\TravelRequest;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Ratings exchanged after a completed delivery: senders rate the traveler who
 * carried their colis, and travelers rate the sender.
 */
class RatingController extends Controller
{
    /**
     * Completed deliveries the user can still rate (delivered, not yet rated),
     * for the given role.
     */
    public function pending(Request $request)
    {
        $role = $request->query('role') === 'traveler' ? 'traveler' : 'sender';
        $userId = Auth::id();

        $query = TravelRequest::with([
                'package:id,package_name,user_id',
                'travel:id,user_id,from_city_id,to_city_id',
                'travel.from_city:id,name',
                'travel.to_city:id,name',
                'sender:id,first_name,last_name,name,profile_picture',
                'travel.user:id,first_name,last_name,name,profile_picture',
            ])
            ->where('status', 'delivered')
            ->whereDoesntHave('ratings', fn ($q) => $q->where('rater_id', $userId));

        if ($role === 'sender') {
            $query->whereHas('package', fn ($q) => $q->where('user_id', $userId));
        } else {
            $query->whereHas('travel', fn ($q) => $q->where('user_id', $userId));
        }

        $items = $query->latest('delivered_at')->get()->map(function (TravelRequest $tr) use ($role) {
            $other = $role === 'sender' ? $tr->travel?->user : $tr->sender;

            return [
                'travel_request_id' => $tr->id,
                'package'           => $tr->package?->package_name ?? 'Colis',
                'from_city'         => $tr->travel?->from_city?->name ?? '—',
                'to_city'           => $tr->travel?->to_city?->name ?? '—',
                'ratee'             => $this->displayName($other),
                'ratee_avatar'      => $other?->profile_picture,
                'delivered_at'      => $tr->delivered_at,
            ];
        })->values();

        return response()->json($items);
    }

    /**
     * Ratings the user has already given (for the given role).
     */
    public function given(Request $request)
    {
        $role = in_array($request->query('role'), ['sender', 'traveler'], true)
            ? $request->query('role')
            : null;

        $query = Rating::where('rater_id', Auth::id())
            ->with(['ratee:id,first_name,last_name,name,profile_picture', 'travelRequest.package:id,package_name'])
            ->latest();

        if ($role) {
            $query->where('role', $role);
        }

        return response()->json(
            $query->get()->map(fn (Rating $r) => [
                'id'         => $r->id,
                'stars'      => $r->stars,
                'comment'    => $r->comment,
                'ratee'      => $this->displayName($r->ratee),
                'ratee_avatar' => $r->ratee?->profile_picture,
                'package'    => $r->travelRequest?->package?->package_name,
                'created_at' => $r->created_at,
            ])->values()
        );
    }

    /**
     * Ratings received by the user, with the average and a star breakdown.
     */
    public function received()
    {
        $userId = Auth::id();

        $ratings = Rating::where('ratee_id', $userId)
            ->with(['rater:id,first_name,last_name,name,profile_picture', 'travelRequest.package:id,package_name'])
            ->latest()
            ->get();

        $breakdown = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        foreach ($ratings as $r) {
            $breakdown[$r->stars] = ($breakdown[$r->stars] ?? 0) + 1;
        }

        return response()->json([
            'average' => $ratings->count() ? round((float) $ratings->avg('stars'), 1) : null,
            'count'   => $ratings->count(),
            'breakdown' => $breakdown,
            'items'   => $ratings->map(fn (Rating $r) => [
                'id'         => $r->id,
                'stars'      => $r->stars,
                'comment'    => $r->comment,
                'role'       => $r->role,
                'rater'      => $this->displayName($r->rater),
                'rater_avatar' => $r->rater?->profile_picture,
                'package'    => $r->travelRequest?->package?->package_name,
                'created_at' => $r->created_at,
            ])->values(),
        ]);
    }

    /**
     * Leave a rating on a completed delivery.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'travel_request_id' => ['required', 'exists:travel_requests,id'],
            'stars'             => ['required', 'integer', 'min:1', 'max:5'],
            'comment'           => ['nullable', 'string', 'max:1000'],
        ]);

        $userId = Auth::id();

        $travelRequest = TravelRequest::with(['package', 'travel'])->findOrFail($validated['travel_request_id']);

        if ($travelRequest->status !== 'delivered') {
            return response()->json(['message' => 'Vous ne pouvez évaluer qu\'une livraison terminée.'], 422);
        }

        $isSender   = $travelRequest->package?->user_id === $userId;
        $isTraveler = $travelRequest->travel?->user_id === $userId;

        if (! $isSender && ! $isTraveler) {
            return response()->json(['message' => 'Cette livraison ne vous concerne pas.'], 403);
        }

        // Block a duplicate rating from the same author on the same delivery.
        if (Rating::where('travel_request_id', $travelRequest->id)->where('rater_id', $userId)->exists()) {
            return response()->json(['message' => 'Vous avez déjà évalué cette livraison.'], 409);
        }

        $role    = $isSender ? 'sender' : 'traveler';
        $rateeId = $isSender ? $travelRequest->travel?->user_id : $travelRequest->package?->user_id;

        $rating = Rating::create([
            'travel_request_id' => $travelRequest->id,
            'rater_id'          => $userId,
            'ratee_id'          => $rateeId,
            'role'              => $role,
            'stars'             => $validated['stars'],
            'comment'           => $validated['comment'] ?? null,
        ]);

        // Notify the rated member.
        $raterName = $this->displayName(Auth::user());
        UserNotification::create([
            'user_id' => $rateeId,
            'type'    => 'rating_received',
            'title'   => 'Nouvelle évaluation',
            'message' => "{$raterName} vous a attribué {$rating->stars}/5.",
            'data'    => ['rating_id' => $rating->id, 'travel_request_id' => $travelRequest->id],
        ]);

        return response()->json([
            'message' => 'Merci pour votre évaluation !',
            'rating'  => $rating,
        ], 201);
    }

    private function displayName(?User $u): string
    {
        if (! $u) {
            return 'Membre';
        }
        $full = trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? ''));
        return $full !== '' ? $full : ($u->name ?? 'Membre');
    }
}
