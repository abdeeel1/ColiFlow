<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();

            // The delivery the rating is about.
            $table->foreignId('travel_request_id')->constrained('travel_requests')->cascadeOnDelete();

            // Who rates and who is rated.
            $table->foreignId('rater_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('ratee_id')->constrained('users')->cascadeOnDelete();

            // The side the author rates from: 'sender' rating a traveler, or 'traveler' rating a sender.
            $table->string('role')->default('sender'); // sender | traveler

            $table->unsignedTinyInteger('stars'); // 1..5
            $table->text('comment')->nullable();

            $table->timestamps();

            // One rating per delivery per author.
            $table->unique(['travel_request_id', 'rater_id']);
            $table->index('ratee_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
