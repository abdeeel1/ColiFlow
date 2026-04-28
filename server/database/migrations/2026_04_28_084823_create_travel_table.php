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
        Schema::create('travels', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->foreignId('from_city_id')->constrained('cities');
            $table->foreignId('to_city_id')->constrained('cities');

            $table->timestamp('departure_date');

            $table->integer('max_weight');
            $table->integer('price');

            $table->string('car_identifier');
            $table->string('car_model');
            $table->enum('car_type', ['voiture', 'moto', 'camionnette', 'petit_camion']);

            $table->json('accepted_categories')->nullable();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travels');
    }
};
