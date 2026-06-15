<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * When an admin rejects a verification track, the selected reasons (motifs)
     * are stored here so the member can see exactly why on their profile.
     * One column per track, mirroring statut_verification / vehicle_verification.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('identity_rejection_reasons')->nullable()->after('vehicle_verification');
            $table->json('vehicle_rejection_reasons')->nullable()->after('identity_rejection_reasons');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['identity_rejection_reasons', 'vehicle_rejection_reasons']);
        });
    }
};
