<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    /**
     * All members for the "Gestion des Membres" page (one row per user, no split
     * between senders and travelers).
     */
    public function index()
    {
        $members = User::latest('created_at')->get()->map(fn ($u) => $this->payload($u))->values();

        return response()->json([
            'members' => $members,
            'total'   => $members->count(),
            'counts'  => [
                'active'    => $members->where('status', 'active')->count(),
                'suspended' => $members->where('status', 'suspended')->count(),
                'banned'    => $members->where('status', 'banned')->count(),
            ],
        ]);
    }

    /**
     * Create a new administrator (the "Ajouter un Admin" action).
     */
    public function storeAdmin(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name'              => trim($data['first_name'] . ' ' . $data['last_name']),
            'first_name'        => $data['first_name'],
            'last_name'         => $data['last_name'],
            'email'             => $data['email'],
            'password'          => $data['password'], // hashed by the model cast
            'role'              => 'admin',
            'is_traveler'       => false,
            'status'            => 'active',
            'accept'            => true,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Administrateur ajouté avec succès.',
            'member'  => $this->payload($user),
        ], 201);
    }

    /**
     * Reassign a member's role (Expéditeur / Voyageur / Mixte / Admin).
     */
    public function updateRole(User $user, Request $request)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez pas changer votre propre rôle.'], 422);
        }

        $role = $request->validate([
            'role' => ['required', Rule::in(['expediteur', 'voyageur', 'mixte', 'admin'])],
        ])['role'];

        $user->role = $role;
        // Keep the functional traveler flag in sync with the assigned role.
        if ($role === 'voyageur' || $role === 'mixte') {
            $user->is_traveler = true;
        } elseif ($role === 'expediteur') {
            $user->is_traveler = false;
        }
        $user->save();

        $this->notify($user, 'Rôle mis à jour', 'Votre rôle a été modifié en « ' . $this->roleLabel($user) . ' » par un administrateur.');

        return response()->json([
            'message' => 'Rôle mis à jour.',
            'member'  => $this->payload($user->fresh()),
        ]);
    }

    /**
     * Moderate a member's account: activate, suspend, ban or flag.
     */
    public function updateStatus(User $user, Request $request)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre statut.'], 422);
        }
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Un administrateur ne peut pas être suspendu ou banni.'], 422);
        }

        $status = $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended', 'banned', 'flagged'])],
        ])['status'];

        $user->status = $status;
        $user->save();

        $labels = ['active' => 'réactivé', 'suspended' => 'suspendu', 'banned' => 'banni', 'flagged' => 'signalé'];
        $this->notify($user, 'Statut du compte', 'Votre compte a été ' . $labels[$status] . ' par un administrateur.');

        return response()->json([
            'message' => 'Statut mis à jour.',
            'member'  => $this->payload($user->fresh()),
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Membre supprimé.']);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function payload(User $u): array
    {
        $roleKey = $this->roleKey($u);

        return [
            'id'         => $u->id,
            'ref'        => '#MB-' . str_pad((string) $u->id, 3, '0', STR_PAD_LEFT),
            'name'       => $this->displayName($u),
            'email'      => $u->email,
            'role'       => $roleKey,
            'role_label' => $this->roleLabel($u),
            'city'       => $u->city,
            'avatar'     => $u->profile_picture,
            // No rating system yet — placeholder score, none for admins.
            'score'      => $roleKey === 'admin' ? null : 5.0,
            'status'     => $u->status ?? 'active',
            'created_at' => $u->created_at,
        ];
    }

    private function roleKey(User $u): string
    {
        return match ($u->role) {
            'admin'      => 'admin',
            'voyageur'   => 'voyageur',
            'mixte'      => 'mixte',
            'expediteur' => 'expediteur',
            default      => $u->is_traveler ? 'voyageur' : 'expediteur', // legacy 'sender'
        };
    }

    private function roleLabel(User $u): string
    {
        return match ($this->roleKey($u)) {
            'admin'    => 'Admin',
            'voyageur' => 'Voyageur',
            'mixte'    => 'Mixte',
            default    => 'Expéditeur',
        };
    }

    private function displayName(User $u): string
    {
        $full = trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? ''));
        return $full !== '' ? $full : ($u->name ?? 'Membre');
    }

    private function notify(User $u, string $title, string $message): void
    {
        UserNotification::create([
            'user_id' => $u->id,
            'type'    => 'account_update',
            'title'   => $title,
            'message' => $message,
            'data'    => ['status' => $u->status, 'role' => $u->role],
        ]);
    }
}
