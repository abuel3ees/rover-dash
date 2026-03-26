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

        // If no rover is assigned to the user, return empty dashboard
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
}
