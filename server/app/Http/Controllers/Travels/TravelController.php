<?php

namespace App\Http\Controllers\Travels;

use App\Http\Controllers\Controller;
use App\Http\Requests\Travels\AddTravelRequest;
use App\Models\Travel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TravelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Travel::with(['user', 'from_city', 'to_city', 'images']);

        if ($request->filled('from_city')) {
            $query->whereHas('from_city', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->from_city . '%');
            });
        }

        if ($request->filled('to_city')) {
            $query->whereHas('to_city', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->to_city . '%');
            });
        }

        if ($request->filled('departure_date')) {
            $query->whereDate('departure_date', $request->departure_date);
        }

        if ($request->filled('max_weight')) {
            $query->where('max_weight', $request->max_weight);
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('car_type')) {
            $query->where('car_type', $request->car_type);
        }

        // Filter by verified users only
        if ($request->filled('verified')) {
            $query->whereHas('user', function ($q) {
                $q->where('vehicle_verification', 'verified');
            });
        }

        $travels = $query->latest()->get();

        return $travels;
    }

    public function featured() {
        return Travel::with(['user', 'from_city', 'to_city', 'images'])->take(4)->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    

    /**
     * Store a newly created resource in storage.
     */
    public function store(AddTravelRequest $request)
    {
        //

        $credentials = $request->validated();
        $user = Auth::user();

        // Suspended/banned members cannot publish travels.
        if (in_array($user->status, ['suspended', 'banned'], true)) {
            return response()->json([
                'message' => 'Votre compte est suspendu. Vous ne pouvez pas publier de trajets. Veuillez contacter le support.',
                'suspended' => true,
            ], 403);
        }

        if(!$user->is_traveler){
            return response()->json([
                'message' => 'Non autorisé'
            ], 403);
        }

        if($user->vehicle_verification !== 'verified'){
            return response()->json([
                'message' => 'Vos documents véhicule doivent être approuvés par un administrateur avant de pouvoir publier un trajet.'
            ], 403);
        }

        DB::beginTransaction();

        try {
        
            $travel = Travel::create([
                'user_id' => $user->id,
                ...$credentials
            ]);

            if($request->hasFile('pictures')) {
                foreach($request->file('pictures') as $file){
                    $path = $file->store('travels', 'public');

                    $travel->images()->create([
                        'path' => $path
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Voyage organisé avec succès',
                'travel' => $travel
            ], 201);

        } catch (\Throwable $err) {
            DB::rollBack();

            return response()->json([
                'message' => "Erreur lors de l'envoi des données. Veuillez vérifier les informations saisies dans le formulaire"
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Travel $travel)
    {
        return response()->json(
            $travel->load(['user', 'from_city', 'to_city', 'images'])
        );
    }

    /**
     * Show the form for editing the specified resource.
     */
    
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Travel $travel)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Travel $travel)
    {
        //
    }
}