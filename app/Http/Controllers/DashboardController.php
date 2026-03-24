<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $rover = $request->user()->rover;

        if (! $rover) {
            return Inertia::render('dashboard', [
                'rover' => null,
                'latestTelemetry' => null,
                'recentCommands' => null,
                'stats' => null,
            ]);
        }

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
            'recentCommands' => $rover->commands()->latest()->limit(8)->get(),
            'stats' => [
                'totalCommands' => $rover->commands()->count(),
                'totalTelemetry' => $rover->telemetryData()->count(),
                'uptime' => $rover->last_seen_at?->diffForHumans(),
            ],
        ]);
    }
}
