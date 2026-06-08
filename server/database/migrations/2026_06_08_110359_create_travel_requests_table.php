<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_id')->constrained('travels')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->text('message')->nullable();
            $table->timestamps();

            // one request per package per travel
            $table->unique(['travel_id', 'package_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_requests');
    }
};