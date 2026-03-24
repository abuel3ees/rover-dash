<?php

namespace App\Http\Controllers;

use App\Models\Rover;
use App\Models\TelemetryData;
use App\Models\Command;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $rover = $request->user()->rover;

        // Create dummy rover with test data if none exists (for testing)
        if (! $rover) {
            $rover = $this->getOrCreateDummyRover($request->user());
        }

        if (! $rover) {
            return Inertia::render('dashboard', [
                'rover' => null,
                'latestTelemetry' => null,
                'recentCommands' => null,
                'recentTelemetry' => null,
                'stats' => null,
                'batteryHistory' => [],
                'temperatureHistory' => [],
            ]);
        }

        // Recent battery readings for sparkline
        $batteryHistory = $rover->telemetryData()
            ->where('type', 'battery')
            ->latest('recorded_at')
            ->limit(20)
            ->pluck('data')
            ->reverse()
            ->values()
            ->map(fn ($d) => $d['percentage'] ?? 0)
            ->all();

        // Recent temperature readings for sparkline
        $temperatureHistory = $rover->telemetryData()
            ->where('type', 'temperature')
            ->latest('recorded_at')
            ->limit(20)
            ->pluck('data')
            ->reverse()
            ->values()
            ->map(fn ($d) => $d['cpu_temp'] ?? 0)
            ->all();

        // Command stats breakdown
        $commandStats = $rover->commands()
            ->selectRaw("status, count(*) as count")
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        return Inertia::render('dashboard', [
            'rover' => [
                ...$rover->toArray(),
                'is_online' => $rover->isOnline(),
            ],
            'latestTelemetry' => [
                'gps' => $rover->latestTelemetry('gps'),
                'battery' => $rover->latestTelemetry('battery'),
                'temperature' => $rover->latestTelemetry('temperature'),
                'accelerometer' => $rover->latestTelemetry('accelerometer'),
            ],
            'recentCommands' => $rover->commands()->latest()->limit(20)->get(),
            'recentTelemetry' => $rover->telemetryData()->latest('recorded_at')->limit(15)->get(),
            'stats' => [
                'totalCommands' => $rover->commands()->count(),
                'totalTelemetry' => $rover->telemetryData()->count(),
                'uptime' => $rover->last_seen_at?->diffForHumans(),
                'commandStats' => $commandStats,
                'executedRate' => $rover->commands()->count() > 0
                    ? round(($commandStats['executed'] ?? 0) / $rover->commands()->count() * 100)
                    : 0,
            ],
            'batteryHistory' => $batteryHistory,
            'temperatureHistory' => $temperatureHistory,
        ]);
    }

    /**
     * Create or get a dummy rover with test data for development/testing
     */
    private function getOrCreateDummyRover($user): ?Rover
    {
        // Check if dummy rover already exists for this user
        $rover = $user->rover;
        
        if ($rover) {
            return $rover;
        }

        // Create dummy rover
        $rover = $user->rover()->create([
            'name' => 'Test Rover Alpha',
            'description' => 'Development rover for testing camera feeds and telemetry',
            'status' => 'online',
            'stream_url' => 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
            'ip_address' => '192.168.1.100',
            'stream_port' => 8081,
            'hardware_info' => [
                'cpu' => 'ARM Cortex-A53',
                'ram' => '4GB',
                'storage' => '64GB SSD',
                'camera' => '1080p USB Camera',
                'os' => 'Ubuntu 22.04 LTS',
            ],
            'last_seen_at' => now(),
        ]);

        // Create sample telemetry data
        $now = now();
        
        // GPS data
        for ($i = 0; $i < 10; $i++) {
            $rover->telemetryData()->create([
                'type' => 'gps',
                'data' => [
                    'latitude' => 37.7749 + (rand(-100, 100) / 10000),
                    'longitude' => -122.4194 + (rand(-100, 100) / 10000),
                    'altitude' => 52 + rand(-10, 10),
                    'speed' => rand(0, 50) / 10,
                    'heading' => rand(0, 360),
                    'satellites' => rand(8, 15),
                    'accuracy' => rand(5, 15),
                ],
                'recorded_at' => $now->copy()->subMinutes($i),
            ]);
        }

        // Battery data
        for ($i = 0; $i < 20; $i++) {
            $rover->telemetryData()->create([
                'type' => 'battery',
                'data' => [
                    'percentage' => 100 - ($i * 2),
                    'voltage' => 12.0 - ($i * 0.1),
                    'current' => 2.5 + (rand(-5, 5) / 10),
                ],
                'recorded_at' => $now->copy()->subMinutes($i),
            ]);
        }

        // Temperature data
        for ($i = 0; $i < 15; $i++) {
            $rover->telemetryData()->create([
                'type' => 'temperature',
                'data' => [
                    'cpu_temp' => 45 + rand(-5, 10),
                    'ambient_temp' => 22 + rand(-3, 5),
                    'motor_temp' => 35 + rand(-5, 15),
                ],
                'recorded_at' => $now->copy()->subMinutes($i),
            ]);
        }

        // Accelerometer data
        for ($i = 0; $i < 12; $i++) {
            $x = (rand(-100, 100) / 100);
            $y = (rand(-100, 100) / 100);
            $z = 9.81 + (rand(-50, 50) / 100);

            // Calculate pitch and roll from accelerometer data
            $pitch = atan2($y, sqrt($x * $x + $z * $z)) * 180 / M_PI;
            $roll = atan2($x, sqrt($y * $y + $z * $z)) * 180 / M_PI;

            $rover->telemetryData()->create([
                'type' => 'accelerometer',
                'data' => [
                    'x' => $x,
                    'y' => $y,
                    'z' => $z,
                    'pitch' => $pitch,
                    'roll' => $roll,
                ],
                'recorded_at' => $now->copy()->subMinutes($i),
            ]);
        }

        return $rover;
    }
}
