<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('vehicle_type')->nullable()->after('bio');
            $table->string('vehicle_brand_model')->nullable()->after('vehicle_type');
            $table->string('vehicle_plate')->nullable()->after('vehicle_brand_model');
            $table->string('vehicle_color')->nullable()->after('vehicle_plate');
            $table->string('vehicle_capacity')->nullable()->after('vehicle_color');
            $table->string('vehicle_photo')->nullable()->after('vehicle_capacity');
            $table->string('permis_document')->nullable()->after('vehicle_photo');
            $table->string('assurance_document')->nullable()->after('permis_document');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'vehicle_type',
                'vehicle_brand_model',
                'vehicle_plate',
                'vehicle_color',
                'vehicle_capacity',
                'vehicle_photo',
                'permis_document',
                'assurance_document',
            ]);
        });
    }
};
