<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RoverTokenController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $rover = $request->user()->rover;

        if (!$rover) {
            return back()->with('error', 'No rover configured. Please set up a rover first.');
        }

        try {
            // Revoke existing tokens before creating a new one
            $rover->tokens()->delete();

            $token = $rover->createToken('pi-access');

            return back()->with('token', $token->plainTextToken)->with('success', 'Token generated successfully!');
        } catch (\Exception $e) {
            \Log::error('Token generation failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to generate token: ' . $e->getMessage());
        }
    }

    public function destroy(Request $request): RedirectResponse
    {
        $rover = $request->user()->rover;

        if (!$rover) {
            return back()->with('error', 'No rover configured.');
        }

        try {
            $rover->tokens()->delete();
            return back()->with('success', 'Token revoked successfully!');
        } catch (\Exception $e) {
            \Log::error('Token revocation failed', ['error' => $e->getMessage()]);
            return back()->with('error', 'Failed to revoke token: ' . $e->getMessage());
        }
    }
}
