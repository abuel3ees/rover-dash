<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TelemetryWebController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $rover = $request->user()->rover;

        if (! $rover) {
            return to_route('rover.create');
        }

        $latestTelemetry = [
            'gps' => $rover->latestTelemetry('gps'),
            'battery' => $rover->latestTelemetry('battery'),
            'temperature' => $rover->latestTelemetry('temperature'),
            'accelerometer' => $rover->latestTelemetry('accelerometer'),
        ];

        $telemetryHistory = $rover->telemetryData()
            ->latest('recorded_at')
            ->take(100)
            ->get();

        return Inertia::render('telemetry', [
            'rover' => [
                'id' => $rover->id,
                'name' => $rover->name,
                'status' => $rover->status,
                'is_online' => $rover->isOnline(),
            ],
            'latestTelemetry' => $latestTelemetry,
            'telemetryHistory' => $telemetryHistory,
        ]);
    }
}
