<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reclamation;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Back-office management of réclamations: a platform-wide view of every claim
 * filed by senders and travelers, plus review / resolution.
 */
class ReclamationController extends Controller
{
    private const RELATIONS = [
        'user:id,first_name,last_name,name,profile_picture,email',
        'againstUser:id,first_name,last_name,name,profile_picture',
        'package:id,package_name',
        'travelRequest:id,status',
    ];

    /**
     * All réclamations with the author, the party they target and stats tiles.
     */
    public function index()
    {
        $reclamations = Reclamation::with(self::RELATIONS)
            ->latest()
            ->get();

        return response()->json([
            'reclamations' => $reclamations->map(fn (Reclamation $r) => $this->payload($r))->values(),
            'stats'        => [
                'total'     => $reclamations->count(),
                'open'      => $reclamations->where('status', 'open')->count(),
                'in_review' => $reclamations->where('status', 'in_review')->count(),
                'resolved'  => $reclamations->where('status', 'resolved')->count(),
                'rejected'  => $reclamations->where('status', 'rejected')->count(),
            ],
        ]);
    }

    /**
     * Update a réclamation's status and/or add an admin response. Both parties
     * are notified when the claim is closed (resolved / rejected).
     */
    public function update(Request $request, Reclamation $reclamation)
    {
        $validated = $request->validate([
            'status'         => ['sometimes', Rule::in(Reclamation::STATUSES)],
            'admin_response' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $previousStatus = $reclamation->status;

        if (array_key_exists('admin_response', $validated)) {
            $reclamation->admin_response = $validated['admin_response'];
        }

        if (isset($validated['status'])) {
            $reclamation->status = $validated['status'];
            $reclamation->resolved_at = in_array($validated['status'], ['resolved', 'rejected'], true)
                ? now()
                : null;
        }

        $reclamation->save();

        // Notify the author when the claim moves to a closed/handled state.
        if (isset($validated['status']) && $validated['status'] !== $previousStatus) {
            $this->notifyAuthor($reclamation);
        }

        return response()->json([
            'message'     => 'Réclamation mise à jour.',
            'reclamation' => $this->payload($reclamation->fresh(self::RELATIONS)),
        ]);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function notifyAuthor(Reclamation $reclamation): void
    {
        $map = [
            'in_review' => ['title' => 'Réclamation en cours d\'examen', 'msg' => "Votre réclamation \"{$reclamation->subject}\" est en cours d'examen."],
            'resolved'  => ['title' => 'Réclamation résolue',            'msg' => "Votre réclamation \"{$reclamation->subject}\" a été résolue."],
            'rejected'  => ['title' => 'Réclamation rejetée',            'msg' => "Votre réclamation \"{$reclamation->subject}\" a été rejetée."],
            'open'      => ['title' => 'Réclamation rouverte',           'msg' => "Votre réclamation \"{$reclamation->subject}\" a été rouverte."],
        ];

        $n = $map[$reclamation->status] ?? null;
        if (! $n) {
            return;
        }

        UserNotification::create([
            'user_id' => $reclamation->user_id,
            'type'    => 'reclamation_update',
            'title'   => $n['title'],
            'message' => $n['msg'],
            'data'    => ['reclamation_id' => $reclamation->id],
        ]);
    }

    private function payload(Reclamation $r): array
    {
        return [
            'id'             => $r->id,
            'ref'            => '#REC-' . str_pad((string) $r->id, 4, '0', STR_PAD_LEFT),
            'type'           => $r->type,
            'subject'        => $r->subject,
            'description'    => $r->description,
            'status'         => $r->status,
            'role'           => $r->role,
            'author'         => $this->displayName($r->user),
            'author_avatar'  => $r->user?->profile_picture,
            'author_email'   => $r->user?->email,
            'against'        => $this->displayName($r->againstUser),
            'against_avatar' => $r->againstUser?->profile_picture,
            'package'        => $r->package?->package_name,
            'admin_response' => $r->admin_response,
            'resolved_at'    => $r->resolved_at,
            'created_at'     => $r->created_at,
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
