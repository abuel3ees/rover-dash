<?php

namespace Database\Factories;

use App\Models\Rover;
use App\Models\TelemetryData;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TelemetryData>
 */
class TelemetryDataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rover_id' => Rover::factory(),
            'type' => $this->faker->randomElement(['gps', 'accelerometer', 'temperature', 'battery', 'signal']),
            'data' => [
                'value' => $this->faker->randomFloat(2, 0, 100),
                'unit' => 'metric',
            ],
            'recorded_at' => $this->faker->dateTime(),
        ];
    }
}
