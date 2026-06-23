<?php

namespace App\Http\Controllers\Packages;

use App\Http\Controllers\Controller;
use App\Http\Requests\Packages\AddPackageRequest;
use App\Models\Package;
use App\Models\UserNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests as AccessAuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    use AccessAuthorizesRequests;

    /**
     * Display a listing of the resource (sender's own packages).
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $packages = Package::with([
                'from_city',
                'to_city',
                'images',
                'travelRequests' => fn($q) => $q
                    ->whereIn('status', ['accepted', 'in_transit', 'delivered'])
                    ->with('travel.user')
                    ->latest(),
            ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // Build per-week count for the last 10 ISO weeks. Computed in PHP from the
        // already-loaded collection so it stays portable across MySQL and SQLite
        // (avoids the MySQL-only YEARWEEK function).
        $weeklyCounts = [];
        for ($i = 9; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd   = now()->subWeeks($i)->endOfWeek();
            $weeklyCounts[] = $packages
                ->filter(fn ($p) => $p->created_at >= $weekStart && $p->created_at <= $weekEnd)
                ->count();
        }

        // Stats per category
        $byCategory = Package::where('user_id', $user->id)
            ->select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get()
            ->pluck('count', 'category');

        // Delivery speed data (days between created_at and date_delivery)
        $deliveryTimes = Package::where('user_id', $user->id)
            ->whereNotNull('date_delivery')
            ->orderBy('created_at')
            ->take(14)
            ->get()
            ->map(fn($p) => max(1, (int) $p->date_delivery->diffInDays(now())))
            ->values();

        return response()->json([
            'packages'      => $packages,
            'total'         => $packages->count(),
            'this_week'     => $packages->where('created_at', '>=', now()->startOfWeek())->count(),
            'total_spent'   => $packages->sum('price'),
            'weekly_counts' => $weeklyCounts,
            'by_category'   => $byCategory,
            'delivery_times'=> $deliveryTimes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AddPackageRequest $request)
    {
        $validated = $request->validated();
        $user = Auth::user();

        // Suspended/banned members cannot create packages.
        if (in_array($user->status, ['suspended', 'banned'], true)) {
            return response()->json([
                'message' => 'Votre compte est suspendu. Vous ne pouvez pas créer de colis. Veuillez contacter le support.',
                'suspended' => true,
            ], 403);
        }

        DB::beginTransaction();

        try {
            $package = Package::create([
                ...$validated,
                'user_id' => $user->id,
            ]);

            if ($request->hasFile('pictures')) {
                foreach ($request->file('pictures') as $file) {
                    $path = $file->store('packages', 'public');
                    $package->images()->create(['path' => $path]);
                }
            }

            DB::commit();

            UserNotification::create([
                'user_id' => $user->id,
                'type'    => 'package_created',
                'title'   => 'Colis ajouté',
                'message' => "Votre colis \"{$package->package_name}\" a été créé avec succès.",
                'data'    => ['package_id' => $package->id],
            ]);

            return response()->json([
                'message' => 'le paquet a été créé avec succès',
                'package' => $package
            ], 201);

        } catch (\Throwable $err) {
            DB::rollBack();
            return response()->json(['message' => $err->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Package $package)
    {
        $userId = Auth::id();

        // The sender who owns it, or the traveler who accepted to carry it.
        $isOwner = (int) $package->user_id === (int) $userId;
        $isCarrier = $package->travelRequests()
            ->whereIn('status', ['accepted', 'in_transit', 'delivered'])
            ->whereHas('travel', fn ($q) => $q->where('user_id', $userId))
            ->exists();

        if (! $isOwner && ! $isCarrier) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        return response()->json(
            $package->load([
                'from_city',
                'to_city',
                'images',
                'travelRequests' => fn ($q) => $q
                    ->whereIn('status', ['accepted', 'in_transit', 'delivered'])
                    ->with('travel.user')
                    ->latest(),
            ])
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Package $package)
    {
        // Only the sender who owns the package may edit it.
        if ((int) $package->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        // A delivered package is locked — it can no longer be edited.
        if ($package->travelRequests()->where('status', 'delivered')->exists()) {
            return response()->json(['message' => 'Un colis livré ne peut plus être modifié.'], 422);
        }

        $validated = $request->validate([
            'from_city_id'  => ['sometimes', 'exists:cities,id', 'different:to_city_id'],
            'to_city_id'    => ['sometimes', 'exists:cities,id'],
            'package_name'  => ['sometimes', 'string', 'min:3', 'max:255'],
            'category'      => ['sometimes', 'in:electronique,documents,mode,maison,autre'],
            'package_size'  => ['sometimes', 'numeric', 'min:0'],
            'description'   => ['nullable', 'string', 'max:1000'],
            'date_delivery' => ['sometimes', 'date'],
            'urgency'       => ['sometimes', 'in:standard,urgent,très_urgent'],
            'price'         => ['sometimes', 'numeric', 'min:1'],
        ]);

        $package->update($validated);

        return response()->json([
            'message' => 'Colis mis à jour avec succès.',
            'package' => $package->fresh(['from_city', 'to_city', 'images']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package)
    {
        // Only the sender who owns the package may delete it.
        if ((int) $package->user_id !== (int) Auth::id()) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $package->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }
}