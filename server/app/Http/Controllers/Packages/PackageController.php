<?php

namespace App\Http\Controllers\Packages;

use App\Http\Controllers\Controller;
use App\Http\Requests\Packages\AddPackageRequest;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource (sender's own packages).
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $packages = Package::with(['from_city', 'to_city', 'images'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        // Build per-week count for last 10 weeks
        $weeklyData = Package::where('user_id', $user->id)
            ->select(
                DB::raw('YEARWEEK(created_at, 1) as week_key'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', now()->subWeeks(10))
            ->groupBy('week_key')
            ->orderBy('week_key')
            ->get()
            ->keyBy('week_key');

        $weeklyCounts = [];
        for ($i = 9; $i >= 0; $i--) {
            $key = now()->subWeeks($i)->format('oW'); // ISO year + week
            $weeklyCounts[] = (int) ($weeklyData[$key]->count ?? 0);
        }

        // Stats per category
        $byCategory = Package::where('user_id', $user->id)
            ->select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get()
            ->pluck('count', 'category');

        // Delivery speed mock data (days between created_at and date_delivery)
        $deliveryTimes = Package::where('user_id', $user->id)
            ->whereNotNull('date_delivery')
            ->orderBy('created_at')
            ->take(14)
            ->get()
            ->map(fn($p) => max(1, (int) now()->diffInHours($p->date_delivery, false) * -1))
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

            return response()->json([
                'message' => 'le paquet a été créé avec succès',
                'package' => $package
            ], 201);

        } catch (\Throwable $err) {
            DB::rollBack();
            return response()->json(['message' => $err->getMessage()], 500);
        }
    }

    public function show(Package $package)
    {
        return response()->json($package->load(['from_city', 'to_city', 'images']));
    }

    public function update(Request $request, Package $package)
    {
        //
    }

    public function destroy(Package $package)
    {
        $this->authorize('delete', $package);
        $package->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }
}