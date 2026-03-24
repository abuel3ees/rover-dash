<?php

namespace Database\Factories;

use App\Models\Rover;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rover>
 */
class RoverFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->word() . ' Rover',
            'description' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(['online', 'offline', 'error', 'maintenance']),
            'stream_url' => $this->faker->url(),
            'ip_address' => $this->faker->ipv4(),
            'stream_port' => $this->faker->numberBetween(1000, 9000),
            'hardware_info' => [
                'cpu' => 'ARM Cortex-A53',
                'ram' => '4GB',
                'storage' => '32GB',
            ],
            'last_seen_at' => $this->faker->dateTime(),
        ];
    }
}
