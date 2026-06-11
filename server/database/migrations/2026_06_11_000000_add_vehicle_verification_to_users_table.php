<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Identity (CIN) and vehicle/document verification are independent:
     * a user can be a verified sender but an unverified traveler.
     * statut_verification stays the identity track; this adds the vehicle track.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('vehicle_verification', 20)->default('pending')->after('statut_verification');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('vehicle_verification');
        });
    }
};
