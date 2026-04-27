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
        ['name' => 'Casablanca', 'postal_code' => '20000'],
        ['name' => 'Rabat', 'postal_code' => '10000'],
        ['name' => 'Marrakech', 'postal_code' => '40000'],
        ['name' => 'Fes', 'postal_code' => '30000'],
        ['name' => 'Agadir', 'postal_code' => '80000'],
        ['name' => 'Tangier', 'postal_code' => '90000'],
        ['name' => 'Oujda', 'postal_code' => '60000'],
        ['name' => 'Kenitra', 'postal_code' => '14000'],
        ['name' => 'Tetouan', 'postal_code' => '93000'],
        ['name' => 'El Jadida', 'postal_code' => '24000'],
        ];

        foreach ($cities as $city) {
            
                City::firstOrCreate(
                    ['name' => $city['name']],
                    $city
                );
            
        }
    }
}
