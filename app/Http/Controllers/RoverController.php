<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoverRequest;
use App\Http\Requests\UpdateRoverRequest;
use App\Models\Rover;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoverController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->rover) {
            return to_route('rover.edit');
        }

        return Inertia::render('rover/setup');
    }

    public function store(StoreRoverRequest $request): RedirectResponse
    {
        $request->user()->rover()->create($request->validated());

        return to_route('dashboard');
    }

    public function edit(Request $request): Response
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);

        return Inertia::render('rover/settings', [
            'rover' => $rover,
            'hasToken' => $rover->tokens()->exists(),
        ]);
    }

    public function update(UpdateRoverRequest $request): RedirectResponse
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);

        $rover->update($request->validated());

        return back();
    }

    public function destroy(Request $request): RedirectResponse
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);

        $rover->delete();

        return to_route('dashboard');
    }
}
