<?php

namespace App\Http\Controllers\Travels;

use App\Http\Controllers\Controller;
use App\Mail\PickupCodeMail;
use App\Models\Package;
use App\Models\Travel;
use App\Models\TravelRequest;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        // Notify the traveler about the new request
        UserNotification::create([
            'user_id' => $travel->user_id,
            'type'    => 'request_received',
            'title'   => 'Nouvelle demande de transport',
            'message' => "Un expéditeur souhaite envoyer le colis \"{$package->package_name}\" avec vous.",
            'data'    => [
                'travel_request_id' => $travelRequest->id,
                'package_id'        => $package->id,
                'travel_id'         => $travel->id,
            ],
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
            'status' => 'required|in:accepted,rejected,delivered',
        ]);

        // Only the traveler of that travel can update
        if ($travelRequest->travel->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        // A traveler must have a verified vehicle/documents before accepting colis
        if ($request->status === 'accepted' && Auth::user()->vehicle_verification !== 'verified') {
            return response()->json([
                'message' => "Votre véhicule n'est pas encore vérifié. Faites valider vos documents avant d'accepter des colis.",
            ], 403);
        }

        // A colis can only be marked delivered once it is actually in transit (picked up).
        if ($request->status === 'delivered' && $travelRequest->status !== 'in_transit') {
            return response()->json([
                'message' => "Vous devez d'abord confirmer la récupération du colis avec le code de l'expéditeur.",
            ], 422);
        }

        $attributes = ['status' => $request->status];

        // On acceptance, generate the pickup code and email it to the sender.
        if ($request->status === 'accepted') {
            $attributes['pickup_code'] = $this->generatePickupCode();
        }

        if ($request->status === 'delivered') {
            $attributes['delivered_at'] = now();
        }

        $travelRequest->update($attributes);

        if ($request->status === 'accepted') {
            $this->sendPickupCodeEmail($travelRequest);
        }

        $packageName = $travelRequest->package->package_name ?? 'votre colis';

        $notifMap = [
            'accepted'  => ['type' => 'request_accepted',  'title' => 'Demande acceptée',        'msg' => "Un voyageur a accepté de transporter \"{$packageName}\". Un code de remise vous a été envoyé par email."],
            'rejected'  => ['type' => 'request_rejected',  'title' => 'Demande refusée',         'msg' => "Un voyageur a refusé de transporter \"{$packageName}\"."],
            'delivered' => ['type' => 'request_delivered', 'title' => 'Colis livré',              'msg' => "Votre colis \"{$packageName}\" a été livré avec succès."],
        ];

        if (isset($notifMap[$request->status])) {
            $n = $notifMap[$request->status];
            UserNotification::create([
                'user_id' => $travelRequest->package->user_id,
                'type'    => $n['type'],
                'title'   => $n['title'],
                'message' => $n['msg'],
                'data'    => [
                    'travel_request_id' => $travelRequest->id,
                    'package_id'        => $travelRequest->package_id,
                ],
            ]);
        }

        $labels = ['accepted' => 'Demande acceptée.', 'rejected' => 'Demande refusée.', 'delivered' => 'Livraison confirmée.'];
        return response()->json([
            'message'        => $labels[$request->status] ?? 'Statut mis à jour.',
            'travel_request' => $travelRequest,
        ]);
    }

    /**
     * Traveler confirms package pickup by entering the code the sender received by email.
     * Moves the request from "accepted" to "in_transit" (livraison en cours).
     */
    public function verifyPickupCode(Request $request, TravelRequest $travelRequest)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        // Only the traveler of that travel can confirm pickup
        if ($travelRequest->travel->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($travelRequest->status !== 'accepted') {
            return response()->json([
                'message' => 'Cette demande ne peut pas être prise en charge (déjà récupérée ou non acceptée).',
            ], 422);
        }

        $submitted = strtoupper(trim($request->code));

        if (! $travelRequest->pickup_code || $submitted !== strtoupper($travelRequest->pickup_code)) {
            return response()->json(['message' => 'Code incorrect. Vérifiez le code communiqué par l\'expéditeur.'], 422);
        }

        $travelRequest->update([
            'status'       => 'in_transit',
            'picked_up_at' => now(),
        ]);

        $packageName = $travelRequest->package->package_name ?? 'votre colis';

        UserNotification::create([
            'user_id' => $travelRequest->package->user_id,
            'type'    => 'request_in_transit',
            'title'   => 'Livraison en cours',
            'message' => "Le voyageur a récupéré votre colis \"{$packageName}\". La livraison est en cours.",
            'data'    => [
                'travel_request_id' => $travelRequest->id,
                'package_id'        => $travelRequest->package_id,
            ],
        ]);

        return response()->json([
            'message'        => 'Code validé. Livraison en cours.',
            'travel_request' => $travelRequest,
        ]);
    }

    /**
     * Traveler pushes their current GPS position for an in-transit delivery.
     */
    public function updateLocation(Request $request, TravelRequest $travelRequest)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        if ($travelRequest->travel->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($travelRequest->status !== 'in_transit') {
            return response()->json([
                'message' => 'Le partage de position n\'est disponible que pour une livraison en cours.',
            ], 422);
        }

        $travelRequest->update([
            'location_sharing'    => true,
            'current_lat'         => $validated['lat'],
            'current_lng'         => $validated['lng'],
            'location_updated_at' => now(),
        ]);

        return response()->json(['message' => 'Position mise à jour.']);
    }

    /**
     * Traveler stops sharing their position.
     */
    public function stopLocation(TravelRequest $travelRequest)
    {
        if ($travelRequest->travel->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $travelRequest->update(['location_sharing' => false]);

        return response()->json(['message' => 'Partage de position arrêté.']);
    }

    /**
     * Sender (or traveler) reads the latest known position of an in-transit colis,
     * along with the origin / destination coordinates for map display.
     */
    public function showLocation(TravelRequest $travelRequest)
    {
        $travelRequest->loadMissing([
            'package.from_city',
            'package.to_city',
            'travel.from_city',
            'travel.to_city',
            'travel.user',
            'sender',
        ]);

        $isSender   = $travelRequest->package->user_id === Auth::id();
        $isTraveler = $travelRequest->travel->user_id === Auth::id();

        if (! $isSender && ! $isTraveler) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $from = $travelRequest->package->from_city ?? $travelRequest->travel->from_city;
        $to   = $travelRequest->package->to_city ?? $travelRequest->travel->to_city;

        // Considered "online" if a position arrived within the last 45 seconds.
        $online = $travelRequest->location_sharing
            && $travelRequest->location_updated_at
            && $travelRequest->location_updated_at->gt(now()->subSeconds(45));

        return response()->json([
            'id'         => $travelRequest->id,
            'status'     => $travelRequest->status,
            'sharing'    => (bool) $travelRequest->location_sharing,
            'online'     => $online,
            'position'   => $travelRequest->current_lat !== null ? [
                'lat'        => $travelRequest->current_lat,
                'lng'        => $travelRequest->current_lng,
                'updated_at' => $travelRequest->location_updated_at,
            ] : null,
            'origin'      => $from ? ['lat' => (float) $from->latitude, 'lng' => (float) $from->longitude, 'name' => $from->name] : null,
            'destination' => $to ? ['lat' => (float) $to->latitude, 'lng' => (float) $to->longitude, 'name' => $to->name] : null,
            'traveler'    => [
                'name'   => trim(($travelRequest->travel->user->first_name ?? '') . ' ' . ($travelRequest->travel->user->last_name ?? '')) ?: ($travelRequest->travel->user->name ?? 'Voyageur'),
                'phone'  => $travelRequest->travel->user->phone ?? null,
                'photo'  => $travelRequest->travel->user->profile_picture ?? null,
                'verified' => ($travelRequest->travel->user->vehicle_verification ?? null) === 'verified',
            ],
            'package'     => [
                'name' => $travelRequest->package->package_name ?? null,
            ],
        ]);
    }

    /**
     * Generate a unique 6-character alphanumeric pickup code (no ambiguous chars).
     */
    private function generatePickupCode(): string
    {
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1

        do {
            $code = '';
            for ($i = 0; $i < 6; $i++) {
                $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
            }
        } while (TravelRequest::where('pickup_code', $code)->where('status', 'accepted')->exists());

        return $code;
    }

    /**
     * Email the pickup code to the sender. Failures are logged but never block the response.
     */
    private function sendPickupCodeEmail(TravelRequest $travelRequest): void
    {
        try {
            $travelRequest->loadMissing(['sender', 'package', 'travel.user']);

            if ($travelRequest->sender && $travelRequest->sender->email) {
                Mail::to($travelRequest->sender->email)->send(new PickupCodeMail($travelRequest));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send pickup code email', [
                'travel_request_id' => $travelRequest->id,
                'error'             => $e->getMessage(),
            ]);
        }
    }

    /**
     * Requests received by traveler (for traveler dashboard).
     */
    public function received()
    {
        $requests = TravelRequest::whereHas('travel', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->with([
                'travel.from_city', 'travel.to_city', 'package.images', 'package.to_city',
                'sender' => fn ($q) => $q
                    ->withAvg('ratingsReceived as ratings_avg', 'stars')
                    ->withCount('ratingsReceived as ratings_count'),
            ])
            ->latest()
            ->get();

        return response()->json($requests);
    }
}