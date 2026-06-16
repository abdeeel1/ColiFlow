<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use App\Models\TravelRequest;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Réclamations filed by senders and travelers (colis non livré, contenu
 * suspect, retard, etc.). Admins review them from the back-office.
 */
class ReclamationController extends Controller
{
    /**
     * The current user's own réclamations, optionally scoped to the role they
     * filed them under (sender / traveler) so each dashboard shows its own.
     */
    public function index(Request $request)
    {
        $query = Reclamation::where('user_id', Auth::id())
            ->with([
                'againstUser:id,first_name,last_name,name,profile_picture',
                'package:id,package_name',
                'travelRequest:id,status',
            ])
            ->latest();

        if (in_array($request->query('role'), ['sender', 'traveler'], true)) {
            $query->where('role', $request->query('role'));
        }

        return response()->json(
            $query->get()->map(fn (Reclamation $r) => $this->payload($r))->values()
        );
    }

    /**
     * Deliveries the user can file a réclamation about, for the given role.
     * Sender → claims about colis they sent; traveler → colis they carry.
     */
    public function eligible(Request $request)
    {
        $role = $request->query('role') === 'traveler' ? 'traveler' : 'sender';
        $userId = Auth::id();

        $query = TravelRequest::with([
                'package:id,package_name,user_id',
                'travel.from_city:id,name',
                'travel.to_city:id,name',
                'travel:id,user_id,from_city_id,to_city_id',
                'sender:id,first_name,last_name,name',
                'travel.user:id,first_name,last_name,name',
            ])
            ->whereIn('status', ['accepted', 'in_transit', 'delivered']);

        if ($role === 'sender') {
            $query->whereHas('package', fn ($q) => $q->where('user_id', $userId));
        } else {
            $query->whereHas('travel', fn ($q) => $q->where('user_id', $userId));
        }

        $items = $query->latest()->get()->map(function (TravelRequest $tr) use ($role) {
            $other = $role === 'sender' ? $tr->travel?->user : $tr->sender;

            return [
                'travel_request_id' => $tr->id,
                'package'           => $tr->package?->package_name ?? 'Colis',
                'status'            => $tr->status,
                'from_city'         => $tr->travel?->from_city?->name ?? '—',
                'to_city'           => $tr->travel?->to_city?->name ?? '—',
                'against'           => $this->displayName($other),
            ];
        })->values();

        return response()->json($items);
    }

    /**
     * File a new réclamation about one of the user's deliveries.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'travel_request_id' => ['required', 'exists:travel_requests,id'],
            'type'              => ['required', Rule::in(Reclamation::TYPES)],
            'subject'           => ['required', 'string', 'max:150'],
            'description'       => ['required', 'string', 'max:2000'],
        ]);

        $userId = Auth::id();

        $travelRequest = TravelRequest::with(['package', 'travel'])->findOrFail($validated['travel_request_id']);

        // Determine the side the author is on for this delivery.
        $isSender   = $travelRequest->package?->user_id === $userId;
        $isTraveler = $travelRequest->travel?->user_id === $userId;

        if (! $isSender && ! $isTraveler) {
            return response()->json(['message' => 'Cette livraison ne vous concerne pas.'], 403);
        }

        $role          = $isSender ? 'sender' : 'traveler';
        $againstUserId = $isSender ? $travelRequest->travel?->user_id : $travelRequest->package?->user_id;

        $reclamation = Reclamation::create([
            'user_id'           => $userId,
            'against_user_id'   => $againstUserId,
            'travel_request_id' => $travelRequest->id,
            'package_id'        => $travelRequest->package_id,
            'role'              => $role,
            'type'              => $validated['type'],
            'subject'           => $validated['subject'],
            'description'       => $validated['description'],
            'status'            => 'open',
        ]);

        $this->notifyAdmins($reclamation);

        return response()->json([
            'message'     => 'Réclamation envoyée. Notre équipe la traitera au plus vite.',
            'reclamation' => $this->payload($reclamation->fresh([
                'againstUser:id,first_name,last_name,name,profile_picture',
                'package:id,package_name',
                'travelRequest:id,status',
            ])),
        ], 201);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function notifyAdmins(Reclamation $reclamation): void
    {
        $admins = User::where('role', 'admin')->pluck('id');

        foreach ($admins as $adminId) {
            UserNotification::create([
                'user_id' => $adminId,
                'type'    => 'reclamation_created',
                'title'   => 'Nouvelle réclamation',
                'message' => "Une réclamation a été ouverte : \"{$reclamation->subject}\".",
                'data'    => ['reclamation_id' => $reclamation->id],
            ]);
        }
    }

    private function payload(Reclamation $r): array
    {
        return [
            'id'          => $r->id,
            'ref'         => '#REC-' . str_pad((string) $r->id, 4, '0', STR_PAD_LEFT),
            'type'        => $r->type,
            'subject'     => $r->subject,
            'description' => $r->description,
            'status'      => $r->status,
            'role'        => $r->role,
            'against'     => $this->displayName($r->againstUser),
            'package'     => $r->package?->package_name,
            'admin_response' => $r->admin_response,
            'resolved_at' => $r->resolved_at,
            'created_at'  => $r->created_at,
        ];
    }

    private function displayName(?User $u): string
    {
        if (! $u) {
            return '—';
        }
        $full = trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? ''));
        return $full !== '' ? $full : ($u->name ?? 'Membre');
    }
}
