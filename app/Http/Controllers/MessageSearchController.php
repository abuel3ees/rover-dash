<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageSearchController extends Controller
{
    public function index(Request $request, Conversation $conversation): JsonResponse
    {
        // Gate: user must be participant
        abort_unless(
            $conversation->participants()->where('user_id', auth()->id())->exists(),
            403
        );

        $validated = $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $results = $conversation->messages()
            ->where('body', 'like', '%' . $validated['q'] . '%')
            ->whereNull('deleted_at')
            ->with('user:id,name,avatar')
            ->with('reactions.user')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json(['results' => $results]);
    }
}
