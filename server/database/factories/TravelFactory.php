<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Travel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Travel>
 */
class TravelFactory extends Factory
{
    protected $model = Travel::class;

    public function definition(): array
    {
        return [
            'user_id'             => User::factory()->traveler(),
            'from_city_id'        => City::factory(),
            'to_city_id'          => City::factory(),
            'departure_date'      => now()->addDays(fake()->numberBetween(1, 30)),
            'max_weight'          => fake()->numberBetween(5, 50),
            'price'               => fake()->numberBetween(50, 400),
            'car_identifier'      => strtoupper(fake()->bothify('####-??-##')),
            'car_model'           => fake()->randomElement(['Dacia Logan', 'Renault Clio', 'Peugeot 208']),
            'car_type'            => fake()->randomElement(['voiture', 'moto', 'camionnette', 'petit_camion']),
            'accepted_categories' => ['documents', 'electronique'],
            'latitude'            => fake()->latitude(27, 36),
            'longitude'           => fake()->longitude(-13, -1),
        ];
    }
}
