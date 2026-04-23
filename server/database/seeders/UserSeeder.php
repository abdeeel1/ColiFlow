<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        User::insert([
            [
                'name' => 'abdessamad najib',
                'email' => 'najib@coliflow.ma',
                'password' => Hash::make('Password123*'),
                'phone' => '0697483167',
                'role' => 'admin',
                'is_traveler' => false,
                'statut_verification' => 'verified',
                
            ],
            [
                'name' => 'sara alami',
                'email' => 'sara@gmail.com',
                'password' => Hash::make('Password123*'),
                'phone' => '0645125488',
                'role' => 'sender',
                'is_traveler' => false,
                'statut_verification' => 'pending',
                
            ],
        ]);
    }
}
