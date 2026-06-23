<?php

namespace Tests\Feature\Packages;

use App\Models\City;
use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PackageTest extends TestCase
{
    use RefreshDatabase;

    /** A valid (scalar-only) package payload between two distinct cities. */
    private function packageData(int $fromCityId, int $toCityId, array $overrides = []): array
    {
        return array_merge([
            'from_city_id'     => $fromCityId,
            'to_city_id'       => $toCityId,
            'package_name'     => 'Colis Test',
            'category'         => 'documents',
            'package_size'     => 3,
            'description'      => 'Un colis de test',
            'date_delivery'    => now()->addDays(5)->toDateString(),
            'urgency'          => 'standard',
            'accept_condition' => '1',
            'price'            => 120,
        ], $overrides);
    }

    public function test_guest_cannot_create_a_package(): void
    {
        $this->postJson('/api/packages', [])->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_a_package(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $from = City::factory()->create();
        $to   = City::factory()->create();

        // create() (not image()) avoids requiring the GD extension in the test env.
        $payload = $this->packageData($from->id, $to->id, [
            'pictures' => [UploadedFile::fake()->create('colis.jpg', 100, 'image/jpeg')],
        ]);

        $this->post('/api/packages', $payload)
            ->assertCreated()
            ->assertJsonPath('package.package_name', 'Colis Test');

        $this->assertDatabaseHas('packages', [
            'package_name' => 'Colis Test',
            'user_id'      => $user->id,
        ]);
    }

    public function test_package_creation_requires_mandatory_fields(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/packages', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['from_city_id', 'package_name', 'price', 'pictures']);
    }

    public function test_departure_and_arrival_cities_must_differ(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $city = City::factory()->create();

        $this->postJson('/api/packages', $this->packageData($city->id, $city->id))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['from_city_id']);
    }

    public function test_user_only_sees_their_own_packages(): void
    {
        $user  = User::factory()->create();
        $other = User::factory()->create();
        Package::factory()->count(2)->create(['user_id' => $user->id]);
        Package::factory()->count(3)->create(['user_id' => $other->id]);

        Sanctum::actingAs($user);

        $this->getJson('/api/packages')
            ->assertOk()
            ->assertJsonPath('total', 2);
    }

    public function test_owner_can_delete_their_package(): void
    {
        $user    = User::factory()->create();
        $package = Package::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $this->deleteJson("/api/packages/{$package->id}")->assertOk();
        $this->assertDatabaseMissing('packages', ['id' => $package->id]);
    }

    public function test_user_cannot_delete_someone_elses_package(): void
    {
        $package = Package::factory()->create();

        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/packages/{$package->id}")->assertForbidden();
        $this->assertDatabaseHas('packages', ['id' => $package->id]);
    }
}
