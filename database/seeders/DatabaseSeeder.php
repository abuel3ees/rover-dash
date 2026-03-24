<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create the three authorized users
        User::factory()->create([
            'name' => 'Hamza',
            'email' => 'ham@rover.com',
            'email_verified_at' => now(),
            'password'=> bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Mir',
            'email' => 'mir@rover.com',
            
            'email_verified_at' => now(),
            'password'=> bcrypt('password'),
        ]);

        User::factory()->create([
            'name' => 'Developer',
            'email' => 'dev@rover.com',
            'email_verified_at' => now(),
            'password'=> bcrypt('password'),
        ]);
    }
}
