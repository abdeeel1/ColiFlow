<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use function Laravel\Prompts\table;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->foreignId('from_city_id')->constrained('cities');
            $table->foreignId('to_city_id')->constrained('cities');

            $table->string('package_name');
            $table->enum('category', ['electronique', 'documents', 'mode', 'maison', 'autre']);
            $table->integer('package_size');
            $table->text('description')->nullable();
            $table->timestamp('date_delivery'); 

            $table->enum('urgency', ['standard', 'urgent', 'très_urgent']);
            $table->integer('price');
            $table->boolean('accept_condition')->default(false);

            

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
