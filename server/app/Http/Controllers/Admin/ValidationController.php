<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;

class ValidationController extends Controller
{
    /**
     * One dossier row per pending/handled verification track. A user who
     * submitted both a CIN and vehicle documents produces two independent rows
     * (identity + vehicle) so each can be approved separately.
     */
    public function index()
    {
        $users = User::where('role', '!=', 'admin')
            ->where(function ($q) {
                $q->whereNotNull('document_cin')
                  ->orWhereNotNull('permis_document')
                  ->orWhereNotNull('assurance_document')
                  ->orWhereNotNull('vehicle_photo');
            })
            ->latest('updated_at')
            ->get();

        $dossiers = collect();
        foreach ($users as $u) {
            if ($u->document_cin) {
                $dossiers->push($this->rowPayload($u, 'identity'));
            }
            if ($u->permis_document || $u->assurance_document || $u->vehicle_photo) {
                $dossiers->push($this->rowPayload($u, 'vehicle'));
            }
        }

        // pending first, then rejected, then approved
        $order = ['attente' => 0, 'rejete' => 1, 'approuve' => 2];
        $dossiers = $dossiers->sortBy(fn ($d) => $order[$d['status']] ?? 3)->values();

        return response()->json([
            'dossiers'      => $dossiers,
            'pending_count' => $dossiers->where('status', 'attente')->count(),
        ]);
    }

    /**
     * Full dossier (both tracks) for the document examination page.
     */
    public function show(User $user)
    {
        return response()->json([
            'id'           => $user->id,
            'ref'          => '#VAL-' . str_pad((string) $user->id, 3, '0', STR_PAD_LEFT),
            'name'         => $this->displayName($user),
            'email'        => $user->email,
            'phone'        => $user->phone,
            'city'         => $user->city,
            'is_traveler'  => (bool) $user->is_traveler,
            'submitted_at' => $user->updated_at,

            'identity' => [
                'has'      => (bool) $user->document_cin,
                'status'   => $this->mapStatus($user->statut_verification),
                'document' => $user->document_cin,
                'rejection_reasons' => $user->identity_rejection_reasons ?? [],
            ],

            'vehicle' => [
                'has'    => (bool) ($user->permis_document || $user->assurance_document || $user->vehicle_photo),
                'status' => $this->mapStatus($user->vehicle_verification),
                'rejection_reasons' => $user->vehicle_rejection_reasons ?? [],
                'documents' => [
                    'permis'    => $user->permis_document,
                    'assurance' => $user->assurance_document,
                ],
                'photo'       => $user->vehicle_photo,
                'type'        => $user->vehicle_type,
                'brand_model' => $user->vehicle_brand_model,
                'plate'       => $user->vehicle_plate,
                'color'       => $user->vehicle_color,
                'capacity'    => $user->vehicle_capacity,
            ],
        ]);
    }

    public function approve(User $user, Request $request)
    {
        $category = $this->category($request);
        $this->setStatus($user, $category, 'verified');

        return response()->json([
            'message' => $category === 'identity' ? 'Identité approuvée.' : 'Véhicule approuvé.',
            'dossier' => $this->rowPayload($user->fresh(), $category),
        ]);
    }

    public function reject(User $user, Request $request)
    {
        $category = $this->category($request);
        $reasons  = $this->reasons($request);
        $this->setStatus($user, $category, 'rejected', $reasons);

        return response()->json([
            'message' => $category === 'identity' ? 'Identité rejetée.' : 'Véhicule rejeté.',
            'dossier' => $this->rowPayload($user->fresh(), $category),
        ]);
    }

    /**
     * Approve or reject several dossiers (each {id, category}) at once.
     */
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'items'            => ['required', 'array', 'min:1'],
            'items.*.id'       => ['required', 'integer', 'exists:users,id'],
            'items.*.category' => ['required', 'in:identity,vehicle'],
            'action'           => ['required', 'in:approve,reject'],
            'reasons'          => ['required_if:action,reject', 'array', 'min:1'],
            'reasons.*'        => ['string', 'max:255'],
        ]);

        $isReject = $validated['action'] === 'reject';
        $value    = $isReject ? 'rejected' : 'verified';
        $reasons  = $isReject ? array_values($validated['reasons'] ?? []) : [];
        $count    = 0;

        foreach ($validated['items'] as $item) {
            $user = User::where('id', $item['id'])->where('role', '!=', 'admin')->first();
            if ($user) {
                $this->setStatus($user, $item['category'], $value, $reasons);
                $count++;
            }
        }

        return response()->json([
            'message' => $validated['action'] === 'approve'
                ? "{$count} dossier(s) approuvé(s)."
                : "{$count} dossier(s) rejeté(s).",
        ]);
    }

    // ── core ─────────────────────────────────────────────────────────────────

    private function setStatus(User $user, string $category, string $value, array $reasons = []): void
    {
        // Reasons only persist for a rejection; approving clears any prior motif.
        $rejectionReasons = $value === 'rejected' ? array_values($reasons) : null;

        if ($category === 'identity') {
            $user->statut_verification = $value;
            $user->identity_rejection_reasons = $rejectionReasons;
        } else {
            $user->vehicle_verification = $value;
            $user->vehicle_rejection_reasons = $rejectionReasons;
        }
        $user->save();

        $this->notify($user, $category, $value, $rejectionReasons ?? []);
    }

    private function notify(User $user, string $category, string $value, array $reasons = []): void
    {
        if ($value === 'verified') {
            $message = $category === 'identity'
                ? 'Votre pièce d\'identité (CIN) a été vérifiée. Votre profil est confirmé.'
                : 'Vos documents véhicule ont été approuvés. Vous pouvez désormais publier des trajets et transporter des colis.';
            $title = $category === 'identity' ? 'Identité vérifiée' : 'Véhicule validé';
            $type  = 'verification_approved';
        } else {
            $base = $category === 'identity'
                ? 'Votre pièce d\'identité n\'a pas pu être validée. Merci de la renvoyer (lisible et en cours de validité).'
                : 'Vos documents véhicule n\'ont pas pu être validés. Merci de les renvoyer.';
            // Append the selected motifs so the member knows what to fix.
            $message = $reasons
                ? $base . ' Motif(s) : ' . implode(' ', $reasons)
                : $base;
            $title = $category === 'identity' ? 'Identité refusée' : 'Véhicule refusé';
            $type  = 'verification_rejected';
        }

        UserNotification::create([
            'user_id' => $user->id,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'data'    => ['category' => $category, 'status' => $value, 'reasons' => $reasons],
        ]);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function category(Request $request): string
    {
        return $request->validate([
            'category' => ['required', 'in:identity,vehicle'],
        ])['category'];
    }

    /**
     * The motifs the admin selected in the rejection modal (at least one).
     */
    private function reasons(Request $request): array
    {
        return array_values($request->validate([
            'reasons'   => ['required', 'array', 'min:1'],
            'reasons.*' => ['string', 'max:255'],
        ])['reasons']);
    }

    private function rowPayload(User $u, string $category): array
    {
        $status = $category === 'identity' ? $u->statut_verification : $u->vehicle_verification;

        return [
            'id'       => $u->id,
            'category' => $category,
            'key'      => $u->id . '-' . $category,
            'ref'      => '#VAL-' . str_pad((string) $u->id, 3, '0', STR_PAD_LEFT) . ($category === 'identity' ? '-I' : '-V'),
            'vehicle'  => $category === 'vehicle' ? $this->vehicleLabel($u) : null,
            'user'     => $this->displayName($u),
            'date'     => $u->updated_at,
            'doc_type' => $category === 'identity' ? 'CIN' : $this->vehicleDocType($u),
            'status'   => $this->mapStatus($status),
        ];
    }

    private function displayName(User $u): string
    {
        $full = trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? ''));
        return $full !== '' ? $full : ($u->name ?? 'Membre');
    }

    private function vehicleLabel(User $u): ?string
    {
        if (! $u->vehicle_type && ! $u->vehicle_brand_model) {
            return null;
        }
        return trim(($u->vehicle_type ?? '') . ($u->vehicle_brand_model ? ' - ' . $u->vehicle_brand_model : ''));
    }

    private function vehicleDocType(User $u): string
    {
        return match (true) {
            (bool) $u->permis_document    => 'Permis de conduire',
            (bool) $u->assurance_document => 'Assurance Transport',
            (bool) $u->vehicle_photo      => 'Photo Véhicule',
            default                       => 'Véhicule',
        };
    }

    private function mapStatus(?string $statut): string
    {
        return match ($statut) {
            'verified'            => 'approuve',
            'rejected', 'refused' => 'rejete',
            default               => 'attente',
        };
    }
}
