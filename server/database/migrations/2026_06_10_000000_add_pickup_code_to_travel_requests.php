<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Expand the status enum to cover the full delivery lifecycle.
        DB::statement("ALTER TABLE travel_requests MODIFY COLUMN status ENUM('pending','accepted','rejected','in_transit','delivered') NOT NULL DEFAULT 'pending'");

        Schema::table('travel_requests', function (Blueprint $table) {
            $table->string('pickup_code', 10)->nullable()->after('status');
            $table->timestamp('picked_up_at')->nullable()->after('pickup_code');
            $table->timestamp('delivered_at')->nullable()->after('picked_up_at');
        });
    }

    public function down(): void
    {
        Schema::table('travel_requests', function (Blueprint $table) {
            $table->dropColumn(['pickup_code', 'picked_up_at', 'delivered_at']);
        });

        DB::statement("ALTER TABLE travel_requests MODIFY COLUMN status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending'");
    }
};
