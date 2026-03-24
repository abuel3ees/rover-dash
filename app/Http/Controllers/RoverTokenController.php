<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RoverTokenController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);

        // Revoke existing tokens before creating a new one
        $rover->tokens()->delete();

        $token = $rover->createToken('pi-access');

        return back()->with('token', $token->plainTextToken);
    }

    public function destroy(Request $request): RedirectResponse
    {
        $rover = $request->user()->rover;

        abort_unless($rover, 404);

        $rover->tokens()->delete();

        return back();
    }
}
