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
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
   

    /**
     * Store a newly created resource in storage.
     */
    public function store(AddPackageRequest $request)
    {
        //


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

                    $package->images()->create([
                        'path' => $path
                    ]);
                }
            }

            DB::commit();


            return response()->json([
                'message' => 'le paquet a été créé avec succès',
                'package' => $package
            ], 201);

        } catch (\Throwable $err) {

            DB::rollBack();

            return response()->json([
                'message' => $err->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Package $package)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
   

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Package $package)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package)
    {
        //
    }
}
