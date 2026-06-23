<?php

namespace Tests\Feature\Travels;

use App\Models\City;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TravelTest extends TestCase
{
    use RefreshDatabase;

    /** A valid travel payload (no pictures — used with already-verified travelers). */
    private function travelData(int $fromCityId, int $toCityId, array $overrides = []): array
    {
        return array_merge([
            'from_city_id'        => $fromCityId,
            'to_city_id'          => $toCityId,
            'departure_date'      => now()->addDays(7)->toDateString(),
            'max_weight'          => 20,
            'price'               => 150,
            'car_identifier'      => '1234-AB-56',
            'car_model'           => 'Dacia Logan',
            'car_type'            => 'voiture',
            'latitude'            => 33.5731,
            'longitude'           => -7.5898,
            'accepted_categories' => ['documents', 'electronique'],
        ], $overrides);
    }

    public function test_guest_cannot_publish_a_travel(): void
    {
        $this->postJson('/api/travels', [])->assertUnauthorized();
    }

    public function test_verified_traveler_can_publish_a_travel(): void
    {
        $user = User::factory()->traveler()->create();
        Sanctum::actingAs($user);

        $from = City::factory()->create();
        $to   = City::factory()->create();

        $this->postJson('/api/travels', $this->travelData($from->id, $to->id))
            ->assertCreated();

        $this->assertDatabaseHas('travels', [
            'user_id'   => $user->id,
            'car_model' => 'Dacia Logan',
        ]);
    }

    public function test_non_traveler_cannot_publish_a_travel(): void
    {
        // vehicle_photo set so the request passes validation and reaches the role check.
        $user = User::factory()->create(['is_traveler' => false, 'vehicle_photo' => 'vehicles/x.jpg']);
        Sanctum::actingAs($user);

        $from = City::factory()->create();
        $to   = City::factory()->create();

        $this->postJson('/api/travels', $this->travelData($from->id, $to->id))
            ->assertForbidden();
    }

    public function test_traveler_without_approved_vehicle_cannot_publish(): void
    {
        $user = User::factory()->create([
            'is_traveler'          => true,
            'vehicle_verification' => 'pending',
            'vehicle_photo'        => 'vehicles/x.jpg',
        ]);
        Sanctum::actingAs($user);

        $from = City::factory()->create();
        $to   = City::factory()->create();

        $this->postJson('/api/travels', $this->travelData($from->id, $to->id))
            ->assertForbidden();
    }

    public function test_travel_creation_requires_mandatory_fields(): void
    {
        Sanctum::actingAs(User::factory()->traveler()->create());

        $this->postJson('/api/travels', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['from_city_id', 'departure_date', 'price', 'car_type']);
    }

    public function test_travels_listing_is_public(): void
    {
        Travel::factory()->count(3)->create();

        $this->getJson('/api/travels')
            ->assertOk()
            ->assertJsonCount(3);
    }

    public function test_featured_travels_are_limited_to_four(): void
    {
        Travel::factory()->count(6)->create();

        $this->getJson('/api/travels/featured')
            ->assertOk()
            ->assertJsonCount(4);
    }
}
