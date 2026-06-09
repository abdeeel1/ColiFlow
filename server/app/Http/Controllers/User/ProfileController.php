<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'regex:/^(\+212|0)[5-7]\d{8}$/'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = Auth::user();

        $user->fill($validated);
        $user->name = trim($validated['first_name'].' '.$validated['last_name']);
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user,
        ]);
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:4096'],
        ]);

        $user = Auth::user();

        $path = $request->file('photo')->store('avatars', 'public');

        $user->profile_picture = asset('storage/'.$path);
        $user->save();

        return response()->json([
            'message' => 'Photo de profil mise à jour avec succès',
            'user' => $user,
        ]);
    }

    public function updateDocument(Request $request)
    {
        $request->validate([
            'document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:8192'],
        ]);

        $user = Auth::user();

        $path = $request->file('document')->store('documents', 'public');

        $user->document_cin = asset('storage/'.$path);
        $user->statut_verification = 'pending';
        $user->save();

        return response()->json([
            'message' => 'Document envoyé, en attente de vérification',
            'user' => $user,
        ]);
    }
}
