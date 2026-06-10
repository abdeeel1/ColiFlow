<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\TravelRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * Build the display name + safe public fields for a user.
     */
    private function presentUser(?User $u): ?array
    {
        if (!$u) {
            return null;
        }

        $name = $u->name ?: trim($u->first_name . ' ' . $u->last_name);

        return [
            'id'              => $u->id,
            'name'            => $name ?: 'Utilisateur',
            'profile_picture' => $u->profile_picture,
            'phone'           => $u->phone,
        ];
    }

    /**
     * List of conversations for the authenticated user.
     * Partners are derived from message history AND from the
     * sender <-> traveler relationship found in travel_requests.
     */
    /**
     * Partner ids the current user can chat with, based on the active role.
     * Only an accepted (or already delivered) request opens a conversation.
     */
    private function partnerIdsForCurrentRole(User $me)
    {
        $linkedStatuses = ['accepted', 'delivered'];

        if ($me->is_traveler) {
            // Traveler mode: senders whose packages I accepted to carry.
            $ids = TravelRequest::whereHas('travel', fn ($q) => $q->where('user_id', $me->id))
                ->whereIn('status', $linkedStatuses)
                ->pluck('sender_id');
        } else {
            // Sender mode: travelers who accepted to carry my packages.
            $ids = TravelRequest::where('sender_id', $me->id)
                ->whereIn('status', $linkedStatuses)
                ->with('travel:id,user_id')
                ->get()
                ->pluck('travel.user_id');
        }

        return $ids
            ->filter(fn ($id) => $id && (int) $id !== (int) $me->id)
            ->unique()
            ->values();
    }

    public function conversations()
    {
        $me   = Auth::user();
        $meId = $me->id;

        $partnerIds = $this->partnerIdsForCurrentRole($me);

        $partners = User::whereIn('id', $partnerIds)->get();

        $conversations = $partners->map(function (User $u) use ($meId) {
            $last = Message::where(function ($q) use ($meId, $u) {
                $q->where('sender_id', $meId)->where('receiver_id', $u->id);
            })->orWhere(function ($q) use ($meId, $u) {
                $q->where('sender_id', $u->id)->where('receiver_id', $meId);
            })->latest()->first();

            $unread = Message::where('sender_id', $u->id)
                ->where('receiver_id', $meId)
                ->whereNull('read_at')
                ->count();

            return [
                'user'         => $this->presentUser($u),
                'last_message' => $last?->body,
                'last_time'    => $last?->created_at,
                'unread'       => $unread,
            ];
        })
        ->sortByDesc(fn ($c) => $c['last_time'] ?? '')
        ->values();

        return response()->json(['conversations' => $conversations]);
    }

    /**
     * Full thread between the authenticated user and the given peer.
     * Marks the peer's messages as read.
     */
    public function messages($userId)
    {
        $me = Auth::id();

        $messages = Message::where(function ($q) use ($me, $userId) {
            $q->where('sender_id', $me)->where('receiver_id', $userId);
        })->orWhere(function ($q) use ($me, $userId) {
            $q->where('sender_id', $userId)->where('receiver_id', $me);
        })
        ->orderBy('created_at')
        ->get(['id', 'sender_id', 'receiver_id', 'body', 'read_at', 'edited_at', 'created_at']);

        Message::where('sender_id', $userId)
            ->where('receiver_id', $me)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $peer = User::find($userId);

        return response()->json([
            'messages' => $messages,
            'peer'     => $this->presentUser($peer),
        ]);
    }

    /**
     * Send a message to a peer.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'body'        => 'required|string|max:5000',
        ]);

        $message = Message::create([
            'sender_id'   => Auth::id(),
            'receiver_id' => $data['receiver_id'],
            'body'        => $data['body'],
        ]);

        return response()->json([
            'message' => $message->only(['id', 'sender_id', 'receiver_id', 'body', 'read_at', 'edited_at', 'created_at']),
        ], 201);
    }

    /**
     * Edit a message — only its author may do so.
     */
    public function update(Request $request, Message $message)
    {
        if ((int) $message->sender_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $data = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $message->update([
            'body'      => $data['body'],
            'edited_at' => now(),
        ]);

        return response()->json([
            'message' => $message->only(['id', 'sender_id', 'receiver_id', 'body', 'read_at', 'edited_at', 'created_at']),
        ]);
    }

    /**
     * Delete a message — only its author may do so.
     */
    public function destroy(Message $message)
    {
        if ((int) $message->sender_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    /**
     * Total unread messages — handy for a sidebar/header badge.
     */
    public function unreadCount()
    {
        $me = Auth::user();

        // Role-aware: only count unread messages from partners of the active mode,
        // so the badge matches the conversation list and clears when read.
        $partnerIds = $this->partnerIdsForCurrentRole($me);

        $count = Message::where('receiver_id', $me->id)
            ->whereIn('sender_id', $partnerIds)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}
