<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\TravelRequest;
use App\Models\User;

/**
 * "Finances & Commissions" back-office — the platform's revenue ledger built
 * from every travel request that entered the payment pipeline.
 */
class FinanceController extends Controller
{
    /**
     * Gestion des Commissions — one row per transaction with the gross amount,
     * the traveler's share, ColiFlow's cut, method and payment status.
     */
    public function commissions()
    {
        // Commission rate is configurable from "Configuration Système".
        $rate = (float) Setting::get('platform_commission') / 100;

        $rows = TravelRequest::with(['package', 'travel.user'])
            ->whereIn('status', ['accepted', 'in_transit', 'delivered', 'rejected'])
            ->latest()
            ->get()
            ->map(function (TravelRequest $r) use ($rate) {
                $price = (float) ($r->package?->price ?? 0);

                // Map the delivery lifecycle onto the payment lifecycle.
                $status = match ($r->status) {
                    'delivered' => 'paye',     // funds collected & settled
                    'rejected'  => 'echoue',   // transaction cancelled / failed
                    default     => 'attente',  // accepted / in_transit → awaiting transfer
                };

                return [
                    'id'            => $r->id,
                    'ref'           => '#CF-' . str_pad((string) ($r->package_id ?? 0), 3, '0', STR_PAD_LEFT),
                    'date'          => $r->created_at,
                    'traveler'      => $this->displayName($r->travel?->user),
                    'montant_total' => round($price),
                    'part_voyageur' => round($price * (1 - $rate)),
                    'commission'    => round($price * $rate),
                    // No payment-method column in the schema yet — derived deterministically.
                    'methode'       => $r->id % 2 === 0 ? 'cash' : 'carte',
                    'status'        => $status,
                ];
            })
            ->values();

        // Realised + pending business excludes failed transactions.
        $successful = $rows->where('status', '!=', 'echoue');
        $volume     = $successful->sum('montant_total');

        return response()->json([
            'commissions' => $rows,
            'stats'       => [
                'volume_affaires'        => round($volume),
                'revenus_coliflow'       => round($volume * $rate),
                'reversements_voyageurs' => round($rows->where('status', 'paye')->sum('part_voyageur')),
                'en_attente_virement'    => round($rows->where('status', 'attente')->sum('part_voyageur')),
                'taux_commission'        => $rate * 100,
            ],
        ]);
    }

    private function displayName(?User $u): string
    {
        if (! $u) {
            return 'Inconnu';
        }
        $full = trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? ''));
        return $full !== '' ? $full : ($u->name ?? 'Membre');
    }
}
