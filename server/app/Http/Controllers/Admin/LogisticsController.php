<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Travel;
use App\Models\TravelRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * "Logistique Globale" back-office: a platform-wide view of every trajet in
 * circulation and every colis being delivered, plus admin edit/delete.
 */
class LogisticsController extends Controller
{
    /** Average road speed used to estimate an ETA when no arrival is stored. */
    private const AVG_KMH = 70;

    private const TRAVEL_RELATIONS  = ['user', 'from_city', 'to_city', 'travelRequests'];
    private const PACKAGE_RELATIONS = ['user', 'from_city', 'to_city', 'travelRequests'];

    /**
     * Trajets en Circulation — all travels with their live status, traveler,
     * itinerary, vehicle and (estimated) arrival.
     */
    public function travels()
    {
        $travels = Travel::with(self::TRAVEL_RELATIONS)
            ->latest('departure_date')
            ->get()
            ->map(fn (Travel $t) => $this->travelPayload($t))
            ->values();

        $activeTravels = $travels->where('active', true);

        // Pending requests older than 3 days deserve attention (no dispute system yet).
        $alertes = TravelRequest::where('status', 'pending')
            ->where('created_at', '<', now()->subDays(3))
            ->count();

        return response()->json([
            'travels' => $travels,
            'stats'   => [
                'membres_totaux'   => User::count(),
                'trajets_actifs'   => $activeTravels->count(),
                'colis_en_attente' => TravelRequest::where('status', 'pending')->count(),
                'alertes'          => $alertes,
                'capacite_totale'  => round($activeTravels->sum('capacity'), 1), // kg
            ],
        ]);
    }

    /**
     * Suivi des Livraisons — every colis with its delivery status, sender,
     * weight, destination and insured value.
     */
    public function packages()
    {
        $packages = Package::with(self::PACKAGE_RELATIONS)
            ->latest()
            ->get()
            ->map(fn (Package $p) => $this->packagePayload($p))
            ->values();

        $enTransit  = $packages->where('status', 'en_transit');
        $aRamasser  = $packages->where('status', 'ramassage');
        // Insured value = total worth of colis currently in the field.
        $valeurAssuree = $enTransit->sum('price') + $aRamasser->sum('price');

        return response()->json([
            'packages' => $packages,
            'stats'    => [
                'colis_totaux'   => $packages->count(),
                'en_transit'     => $enTransit->count(),
                'a_ramasser'     => $aRamasser->count(),
                'litiges'        => 0, // no dispute system yet
                'valeur_assuree' => round($valeurAssuree), // DH
            ],
        ]);
    }

    /**
     * Admin edit of a travel — itinerary, schedule, vehicle and capacity.
     */
    public function updateTravel(Request $request, Travel $travel)
    {
        $data = $request->validate([
            'from_city_id'   => ['sometimes', 'exists:cities,id', 'different:to_city_id'],
            'to_city_id'     => ['sometimes', 'exists:cities,id'],
            'departure_date' => ['sometimes', 'date'],
            'max_weight'     => ['sometimes', 'integer', 'min:1'],
            'price'          => ['sometimes', 'integer', 'min:1'],
            'car_model'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'car_type'       => ['sometimes', 'nullable', 'in:voiture,moto,camionnette,petit_camion'],
        ]);

        $travel->update($data);

        return response()->json([
            'message' => 'Trajet mis à jour.',
            'travel'  => $this->travelPayload($travel->fresh(self::TRAVEL_RELATIONS)),
        ]);
    }

    public function destroyTravel(Travel $travel)
    {
        $travel->delete(); // cascades to its travel_requests + cleans up images

        return response()->json(['message' => 'Trajet supprimé.']);
    }

    /**
     * Admin edit of a colis — content, category, weight, value and route.
     */
    public function updatePackage(Request $request, Package $package)
    {
        $data = $request->validate([
            'package_name' => ['sometimes', 'string', 'max:255'],
            'category'     => ['sometimes', Rule::in(['electronique', 'documents', 'mode', 'maison', 'autre'])],
            'package_size' => ['sometimes', 'integer', 'min:1'],
            'price'        => ['sometimes', 'integer', 'min:1'],
            'urgency'      => ['sometimes', Rule::in(['standard', 'urgent', 'très_urgent'])],
            'from_city_id' => ['sometimes', 'exists:cities,id', 'different:to_city_id'],
            'to_city_id'   => ['sometimes', 'exists:cities,id'],
        ]);

        $package->update($data);

        return response()->json([
            'message' => 'Colis mis à jour.',
            'package' => $this->packagePayload($package->fresh(self::PACKAGE_RELATIONS)),
        ]);
    }

    public function destroyPackage(Package $package)
    {
        $package->delete(); // cascades to its travel_requests + cleans up images

        return response()->json(['message' => 'Colis supprimé.']);
    }

    // ── payload builders ────────────────────────────────────────────────────

    private function travelPayload(Travel $t): array
    {
        $reqs      = $t->travelRequests;
        $accepted  = $reqs->where('status', 'accepted');
        $inTransit = $reqs->where('status', 'in_transit');
        $delivered = $reqs->where('status', 'delivered');
        $onboard   = $accepted->count() + $inTransit->count() + $delivered->count();

        // Live status — mirrors the three chips in the design.
        if ($inTransit->isNotEmpty()) {
            $status = 'en_route';          // vehicle is moving with cargo
        } elseif ($accepted->isNotEmpty()) {
            $status = 'chargement';        // cargo accepted, loading before departure
        } else {
            $status = 'en_attente';        // no cargo yet, awaiting requests
        }

        $departure = $t->departure_date;
        $arrival   = $departure ? $departure->copy()->addHours($this->etaHours($t)) : null;

        // "In circulation" = upcoming, today, or already carrying cargo.
        $active = $inTransit->isNotEmpty()
            || $accepted->isNotEmpty()
            || ($departure && $departure->gte(now()->startOfDay()));

        return [
            'id'             => $t->id,
            'ref'            => '#TRJ-' . str_pad((string) $t->id, 3, '0', STR_PAD_LEFT),
            'traveler'       => $this->displayName($t->user),
            'avatar'         => $t->user?->profile_picture,
            'from_city'      => $t->from_city?->name ?? '—',
            'to_city'        => $t->to_city?->name ?? '—',
            'from_city_id'   => $t->from_city_id,
            'to_city_id'     => $t->to_city_id,
            'vehicle'        => $t->car_model ?: $this->vehicleLabel($t->car_type),
            'car_model'      => $t->car_model,
            'vehicle_type'   => $t->car_type,
            'status'         => $status,
            'departure_time' => $departure,
            'arrival_time'   => $arrival,
            'colis'          => $onboard,
            'capacity'       => (float) ($t->max_weight ?? 0),
            'price'          => (float) ($t->price ?? 0),
            'active'         => $active,
        ];
    }

    private function packagePayload(Package $p): array
    {
        // The request that drives the colis status: prefer an active/closed one,
        // else fall back to the latest request (likely pending).
        $req = $p->travelRequests
            ->whereIn('status', ['delivered', 'in_transit', 'accepted'])
            ->sortByDesc('id')
            ->first()
            ?? $p->travelRequests->sortByDesc('id')->first();

        $status = match ($req?->status) {
            'delivered'  => 'livre',
            'in_transit' => 'en_transit',
            'accepted'   => $req->picked_up_at ? 'en_transit' : 'ramassage',
            default      => 'en_attente',
        };

        $weight = (float) ($p->package_size ?? 0);

        return [
            'id'           => $p->id,
            'ref'          => '#CF-' . str_pad((string) $p->id, 3, '0', STR_PAD_LEFT),
            'sender'       => $this->displayName($p->user),
            'avatar'       => $p->user?->profile_picture,
            'object'       => $p->package_name,
            'category'     => $p->category,
            'urgency'      => $p->urgency,
            'weight'       => $weight,
            'weight_label' => $this->weightLabel($weight),
            'status'       => $status,
            'from_city'    => $p->from_city?->name ?? '—',
            'destination'  => $p->to_city?->name ?? '—',
            'from_city_id' => $p->from_city_id,
            'to_city_id'   => $p->to_city_id,
            'price'        => (float) ($p->price ?? 0),
            'locked'       => $status !== 'en_attente', // a colis already in delivery
            'created_at'   => $p->created_at,
        ];
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    /** Rough ETA in hours from the great-circle distance between the two cities. */
    private function etaHours(Travel $t): int
    {
        $from = $t->from_city;
        $to   = $t->to_city;
        if (! $from || ! $to || $from->latitude === null || $to->latitude === null) {
            return 3; // sensible default when coordinates are missing
        }

        $km = $this->haversine($from->latitude, $from->longitude, $to->latitude, $to->longitude);
        return max(1, (int) round($km / self::AVG_KMH));
    }

    private function haversine($lat1, $lon1, $lat2, $lon2): float
    {
        $r = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;
        return $r * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    private function weightLabel(float $w): string
    {
        return match (true) {
            $w < 1   => '- 1 kg',
            $w <= 5  => '1 - 5 kg',
            $w <= 15 => '5 - 15 kg',
            default  => '+ 15 kg',
        };
    }

    private function vehicleLabel(?string $type): string
    {
        return match ($type) {
            'moto'         => 'Moto',
            'camionnette'  => 'Camionnette',
            'petit_camion' => 'Petit camion',
            'voiture'      => 'Voiture',
            default        => 'Véhicule',
        };
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
