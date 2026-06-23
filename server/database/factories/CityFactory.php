<?php

namespace Database\Factories;

use App\Models\City;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<City>
 */
class CityFactory extends Factory
{
    protected $model = City::class;

    public function definition(): array
    {
        return [
            'name'        => fake()->unique()->city(),
            'postal_code' => fake()->numerify('#####'),
            'latitude'    => fake()->latitude(27, 36),   // Morocco-ish bounds
            'longitude'   => fake()->longitude(-13, -1),
        ];
    }
}
