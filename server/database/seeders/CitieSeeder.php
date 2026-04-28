<?php

namespace Database\Seeders;

use App\Models\Citie;
use App\Models\City;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CitieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $cities = [
            ['name' => 'Casablanca', 'postal_code' => '20000', 'latitude' => 33.5731, 'longitude' => -7.5898],
            ['name' => 'Rabat', 'postal_code' => '10000', 'latitude' => 34.0209, 'longitude' => -6.8416],
            ['name' => 'Marrakech', 'postal_code' => '40000', 'latitude' => 31.6295, 'longitude' => -7.9811],
            ['name' => 'Fes', 'postal_code' => '30000', 'latitude' => 34.0181, 'longitude' => -5.0078],
            ['name' => 'Agadir', 'postal_code' => '80000', 'latitude' => 30.4278, 'longitude' => -9.5981],
            ['name' => 'Tangier', 'postal_code' => '90000', 'latitude' => 35.7595, 'longitude' => -5.8340],
            ['name' => 'Oujda', 'postal_code' => '60000', 'latitude' => 34.6814, 'longitude' => -1.9086],
            ['name' => 'Kenitra', 'postal_code' => '14000', 'latitude' => 34.2610, 'longitude' => -6.5802],
            ['name' => 'Tetouan', 'postal_code' => '93000', 'latitude' => 35.5889, 'longitude' => -5.3626],
            ['name' => 'El Jadida', 'postal_code' => '24000', 'latitude' => 33.2316, 'longitude' => -8.5007],
        ];

        foreach ($cities as $city) {
            
                City::firstOrCreate(
                    ['name' => $city['name']],
                    $city
                );
            
        }
    }
}
