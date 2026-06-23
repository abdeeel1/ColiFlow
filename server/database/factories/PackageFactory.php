<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Package;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Package>
 */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    public function definition(): array
    {
        return [
            'user_id'          => User::factory(),
            'from_city_id'     => City::factory(),
            'to_city_id'       => City::factory(),
            'package_name'     => fake()->words(2, true),
            'category'         => fake()->randomElement(['electronique', 'documents', 'mode', 'maison', 'autre']),
            'package_size'     => fake()->numberBetween(1, 20),
            'description'      => fake()->sentence(),
            'date_delivery'    => now()->addDays(fake()->numberBetween(1, 10)),
            'urgency'          => fake()->randomElement(['standard', 'urgent', 'très_urgent']),
            'price'            => fake()->numberBetween(50, 500),
            'accept_condition' => true,
        ];
    }
}
