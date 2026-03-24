<?php

namespace Database\Seeders;

use App\Models\Conversation;
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
        User::create([
            'name' => 'Hamza',
            'email' => 'ham@rover.com',
            'email_verified_at' => now(),
            'password'=> bcrypt('password'),
        ]);

        User::create([
            'name' => 'Mir',
            'email' => 'mir@rover.com',
            
            'email_verified_at' => now(),
            'password'=> bcrypt('password'),
        ]);

        User::create([
            'name' => 'Developer',
            'email' => 'dev@rover.com',
            'email_verified_at' => now(),
            'password'=> bcrypt('password'),
        ]);

        // Create the broadcast conversation
        $broadcast = Conversation::create([
            'type' => 'broadcast',
            'name' => null,
            'created_by' => null,
        ]);

        // Add all users to the broadcast conversation
        $users = User::all();
        foreach ($users as $user) {
            $broadcast->participants()->attach($user->id, ['joined_at' => now()]);
        }
    }
}
