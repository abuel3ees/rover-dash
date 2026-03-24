<?php

use App\Models\User;
use App\Models\Rover;
use App\Models\TelemetryData;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard loads with rover telemetry data', function () {
    $user = User::factory()->create();
    $rover = Rover::factory()->create(['user_id' => $user->id]);
    
    // Create some telemetry data
    TelemetryData::factory()
        ->count(5)
        ->create(['rover_id' => $rover->id]);

    $this->actingAs($user);
    $response = $this->get(route('dashboard'));
    
    $response->assertOk();
});

test('dashboard displays rover status', function () {
    $user = User::factory()->create();
    $rover = Rover::factory()->create([
        'user_id' => $user->id,
        'status' => 'online',
        'name' => 'Test Rover',
    ]);

    $this->actingAs($user);
    $response = $this->get(route('dashboard'));
    
    $response->assertOk();
    $response->assertSee('online');
    $response->assertSee('Test Rover');
});