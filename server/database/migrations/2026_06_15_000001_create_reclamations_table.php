<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reclamations', function (Blueprint $table) {
            $table->id();

            // Author of the claim and the party it is filed against.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('against_user_id')->nullable()->constrained('users')->nullOnDelete();

            // The delivery the claim is about (and a denormalised package_id for quick lookups).
            $table->foreignId('travel_request_id')->nullable()->constrained('travel_requests')->nullOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();

            // Whether the author filed it as the sender (expéditeur) or the traveler (voyageur).
            $table->string('role')->default('sender'); // sender | traveler

            // Nature of the complaint.
            $table->string('type'); // non_livraison | colis_endommage | contenu_suspect | retard | comportement | autre

            $table->string('subject');
            $table->text('description');

            $table->string('status')->default('open'); // open | in_review | resolved | rejected
            $table->text('admin_response')->nullable();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reclamations');
    }
};
