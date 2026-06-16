<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\TravelRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Aggregated data for the admin home dashboard.
     */
    public function dashboard()
    {
        // ── Stat tiles ──────────────────────────────────────────────
        $totalUsers = User::count();

        // Colis currently in circulation (assigned to a traveler, not yet delivered)
        $fluxColis = Package::whereHas('travelRequests', function ($q) {
            $q->whereIn('status', ['accepted', 'in_transit']);
        })->count();

        // Chiffre d'affaires = total value of delivered packages
        $chiffreAffaires = (float) TravelRequest::where('status', 'delivered')
            ->with('package')
            ->get()
            ->sum(fn ($r) => $r->package?->price ?? 0);

        // Taux de succès = delivered / handled requests
        $handledRequests = TravelRequest::whereIn('status', ['accepted', 'in_transit', 'delivered'])->count();
        $deliveredCount  = TravelRequest::where('status', 'delivered')->count();
        $tauxSucces      = $handledRequests > 0 ? round($deliveredCount / $handledRequests * 100, 1) : 0;

        // ── Platform growth: weekly signups (last 10 weeks) ─────────
        $weeklyRaw = User::where('created_at', '>=', now()->subWeeks(10))
            ->select(
                DB::raw('YEARWEEK(created_at, 1) as week_key'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('week_key')
            ->orderBy('week_key')
            ->get()
            ->keyBy('week_key');

        $weeklySignups = [];
        for ($i = 9; $i >= 0; $i--) {
            $key = now()->subWeeks($i)->format('oW');
            $weeklySignups[] = (int) ($weeklyRaw[$key]->count ?? 0);
        }

        $thisWeek = $weeklySignups[9] ?? 0;
        $lastWeek = $weeklySignups[8] ?? 0;
        $growthPercent = $lastWeek > 0
            ? round(($thisWeek - $lastWeek) / $lastWeek * 100)
            : ($thisWeek > 0 ? 100 : 0);

        // Revenue to collect = platform commission on delivered orders
        $commissionRate   = (float) \App\Models\Setting::get('platform_commission') / 100;
        $revenueToCollect = round($chiffreAffaires * $commissionRate);

        // ── Latest document verifications ───────────────────────────
        // A vehicle doc reflects the vehicle track; a bare CIN the identity track.
        $docVerifications = User::where(function ($q) {
                $q->whereNotNull('document_cin')->orWhereNotNull('permis_document');
            })
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(fn ($u) => $u->permis_document
                ? [
                    'user'   => $this->displayName($u),
                    'doc'    => 'Permis de conduire',
                    'date'   => $u->updated_at,
                    'status' => $this->mapVerification($u->vehicle_verification),
                ]
                : [
                    'user'   => $this->displayName($u),
                    'doc'    => 'CIN',
                    'date'   => $u->updated_at,
                    'status' => $this->mapVerification($u->statut_verification),
                ]);

        // ── Next steps: members awaiting verification on either track ──
        $nextSteps = User::where('role', '!=', 'admin')
            ->where(function ($q) {
                $q->where(function ($i) {
                    $i->where('statut_verification', 'pending')->whereNotNull('document_cin');
                })->orWhere(function ($v) {
                    $v->where('vehicle_verification', 'pending')
                      ->where(function ($d) {
                          $d->whereNotNull('permis_document')
                            ->orWhereNotNull('assurance_document')
                            ->orWhereNotNull('vehicle_photo');
                      });
                });
            })
            ->latest('updated_at')
            ->take(3)
            ->get()
            ->map(fn ($u) => [
                'type'  => 'document',
                'title' => "Vérifier Documents #{$u->id}",
                'sub'   => ($u->city ? "Lieu : {$u->city} · " : '') . 'Nouveau membre',
            ])
            ->values();

        // ── System health ───────────────────────────────────────────
        $systemHealth = [
            ['label' => 'Statut Serveur',  'value' => 'Opérationnel',                       'ok' => true],
            ['label' => 'Base de données', 'value' => number_format($totalUsers) . ' membres', 'ok' => true],
            ['label' => 'Service Leaflet', 'value' => 'Active',                              'ok' => true],
        ];

        return response()->json([
            'total_users'        => $totalUsers,
            'flux_colis'         => $fluxColis,
            'chiffre_affaires'   => $chiffreAffaires,
            'taux_succes'        => $tauxSucces,
            'growth_percent'     => $growthPercent,
            'weekly_signups'     => $weeklySignups,
            'revenue_to_collect' => $revenueToCollect,
            'doc_verifications'  => $docVerifications,
            'next_steps'         => $nextSteps,
            'system_health'      => $systemHealth,
        ]);
    }

    private function displayName(User $u): string
    {
        $full = trim(($u->first_name ?? '') . ' ' . ($u->last_name ?? ''));
        return $full !== '' ? $full : ($u->name ?? 'Membre');
    }

    private function mapVerification(?string $statut): string
    {
        return match ($statut) {
            'verified'             => 'valide',
            'rejected', 'refused'  => 'refuse',
            default                => 'attente',
        };
    }
}
