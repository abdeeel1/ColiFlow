<?php

namespace App\Http\Controllers\Travels;

use App\Http\Controllers\Controller;
use App\Models\Travel;
use App\Models\TravelRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TravelerController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        // All travels created by this traveler
        $travels = Travel::where('user_id', $user->id)
            ->with(['from_city', 'to_city'])
            ->latest()
            ->get();

        // Accepted requests on traveler's travels
        $acceptedRequests = TravelRequest::whereHas('travel', fn($q) => $q->where('user_id', $user->id))
            ->where('status', 'accepted')
            ->with(['package.from_city', 'package.to_city', 'travel.from_city', 'travel.to_city'])
            ->latest()
            ->get();

        // Pending requests awaiting traveler's response
        $pendingRequests = TravelRequest::whereHas('travel', fn($q) => $q->where('user_id', $user->id))
            ->where('status', 'pending')
            ->with(['package.from_city', 'package.to_city', 'travel'])
            ->latest()
            ->take(2)
            ->get();

        $totalRevenue    = $acceptedRequests->sum(fn($r) => $r->package?->price ?? 0);
        $thisWeekRevenue = $acceptedRequests
            ->filter(fn($r) => $r->created_at >= now()->startOfWeek())
            ->sum(fn($r) => $r->package?->price ?? 0);

        // Weekly accepted packages count (last 10 weeks)
        $weeklyRaw = TravelRequest::whereHas('travel', fn($q) => $q->where('user_id', $user->id))
            ->where('status', 'accepted')
            ->where('created_at', '>=', now()->subWeeks(10))
            ->select(
                DB::raw('YEARWEEK(created_at, 1) as week_key'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('week_key')
            ->orderBy('week_key')
            ->get()
            ->keyBy('week_key');

        $weeklyCounts = [];
        for ($i = 9; $i >= 0; $i--) {
            $key = now()->subWeeks($i)->format('oW');
            $weeklyCounts[] = (int) ($weeklyRaw[$key]->count ?? 0);
        }

        // Rating history — static 5.0 per delivery until rating system exists
        $pkgCount      = $acceptedRequests->count();
        $ratingHistory = $pkgCount > 0
            ? array_fill(0, min($pkgCount, 10), 5.0)
            : [5.0, 5.0];

        // Next steps: pending requests + latest travel to verify
        $nextSteps = [];
        foreach ($pendingRequests as $req) {
            $nextSteps[] = [
                'type'   => 'request',
                'label'  => "Répondre Colis #{$req->package?->id}",
                'detail' => ($req->package?->from_city?->name ?? '—') . ' → ' . ($req->package?->to_city?->name ?? '—'),
            ];
        }
        $latestTravel = $travels->first();
        if ($latestTravel) {
            $nextSteps[] = [
                'type'   => 'travel',
                'label'  => "Vérifier Trajet #{$latestTravel->id}",
                'detail' => 'Destination : ' . ($latestTravel->to_city?->name ?? '—'),
            ];
        }

        // Badges
        $badges = [];
        $pkgCount = $acceptedRequests->count();
        if ($pkgCount >= 10) {
            $badges[] = ['icon' => 'elite',    'label' => 'Chauffeur Élite'];
        } elseif ($pkgCount >= 1) {
            $badges[] = ['icon' => 'driver',   'label' => 'Chauffeur Actif'];
        }
        if ($pkgCount > 0) {
            $badges[] = ['icon' => 'packages', 'label' => "{$pkgCount} Livraisons réussies"];
        }
        if ($user->document_cin || $user->statut_verification === 'verified') {
            $badges[] = ['icon' => 'verified', 'label' => 'Identité Vérifiée'];
        }

        return response()->json([
            'total_travels'        => $travels->count(),
            'packages_transported' => $pkgCount,
            'total_revenue'        => $totalRevenue,
            'this_week_revenue'    => $thisWeekRevenue,
            'rating'               => 5.0,
            'pending_gains'        => $totalRevenue,
            'weekly_counts'        => $weeklyCounts,
            'rating_history'       => $ratingHistory,
            'next_steps'           => array_slice($nextSteps, 0, 3),
            'badges'               => $badges,
        ]);
    }

    public function travels()
    {
        $user = Auth::user();

        $travels = Travel::where('user_id', $user->id)
            ->with([
                'from_city',
                'to_city',
                'travelRequests.package',
            ])
            ->latest('departure_date')
            ->get()
            ->map(function ($travel) {
                $allRequests  = $travel->travelRequests;
                $accepted     = $allRequests->where('status', 'accepted');
                $pending      = $allRequests->where('status', 'pending');

                $usedWeight   = $accepted->sum(fn($r) => $r->package?->package_size ?? 0);
                $remaining    = max(0, ($travel->max_weight ?? 0) - $usedWeight);
                $gainsEstimes = $accepted->sum(fn($r) => $r->package?->price ?? 0);
                $colisCount   = $accepted->count();

                // Status only changes based on traveler actions (accepted colis), not sender requests
                if ($travel->departure_date && $travel->departure_date < now()) {
                    $status = 'termine';
                } elseif ($accepted->isNotEmpty() && $remaining <= 0) {
                    $status = 'complet';
                } elseif ($accepted->isNotEmpty()) {
                    $status = 'en_route';
                } else {
                    // No accepted colis yet (pending requests don't affect status)
                    $status = 'disponible';
                }

                // Format remaining capacity as a range label
                if ($remaining < 1) {
                    $capaciteLibre = '< 1 kg';
                } elseif ($remaining <= 5) {
                    $capaciteLibre = '1 - 5 kg';
                } elseif ($remaining <= 15) {
                    $capaciteLibre = '5 - 15 kg';
                } else {
                    $capaciteLibre = '+ 15 kg';
                }

                return [
                    'id'             => $travel->id,
                    'from_city'      => $travel->from_city?->name ?? '—',
                    'to_city'        => $travel->to_city?->name   ?? '—',
                    'colis'          => $colisCount,
                    'departure_date' => $travel->departure_date,
                    'capacite_libre' => $capaciteLibre,
                    'status'         => $status,
                    'gains_estimes'  => $gainsEstimes,
                ];
            });

        return response()->json($travels);
    }

    public function destroy(Travel $travel)
    {
        if ($travel->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $hasAccepted = $travel->travelRequests()->where('status', 'accepted')->exists();
        if ($hasAccepted) {
            return response()->json(['message' => 'Impossible de supprimer un trajet avec des colis acceptés.'], 422);
        }

        $travel->delete();
        return response()->json(['message' => 'Trajet supprimé avec succès.']);
    }
}
