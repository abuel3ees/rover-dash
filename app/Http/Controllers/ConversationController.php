<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $conversations = $user->conversations()
            ->with([
                'participants:id,name',
                'latestMessage.user:id,name',
            ])
            ->get()
            ->sortByDesc(function ($conversation) {
                return $conversation->latestMessage?->created_at ?? $conversation->created_at;
            })
            ->values()
            ->map(function ($conversation) use ($user) {
                return [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                    'name' => $conversation->name,
                    'participants' => $conversation->participants->map(fn ($p) => [
                        'id' => $p->id,
                        'name' => $p->name,
                        'avatar' => null,
                        'is_online' => false,
                        'last_active_at' => null,
                    ])->toArray(),
                    'latest_message' => $conversation->latestMessage ? [
                        'id' => $conversation->latestMessage->id,
                        'body' => $conversation->latestMessage->deleted_at ? null : $conversation->latestMessage->body,
                        'user' => [
                            'id' => $conversation->latestMessage->user?->id,
                            'name' => $conversation->latestMessage->user?->name,
                        ],
                        'created_at' => $conversation->latestMessage->created_at->toIso8601String(),
                    ] : null,
                    'unread_count' => $conversation->getUnreadCount($user->id),
                    'created_at' => $conversation->created_at->toIso8601String(),
                ];
            });

        $allUsers = User::where('id', '!=', $user->id)
            ->select('id', 'name', 'email')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'avatar' => null,
                'is_online' => false,
                'last_active_at' => null,
            ]);

        return Inertia::render('messaging', [
            'conversations' => $conversations,
            'allUsers' => $allUsers,
            'broadcastConversationId' => Conversation::where('type', 'broadcast')->first()?->id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:dm,group',
            'participant_ids' => 'required|array|min:1',
            'participant_ids.*' => 'integer|exists:users,id',
            'name' => 'required_if:type,group|string|max:100',
        ]);

        $user = auth()->user();

        // Ensure current user isn't in participant_ids (they'll be added automatically)
        $participantIds = array_filter($validated['participant_ids'], fn ($id) => $id !== $user->id);

        // For DMs, check if conversation already exists
        if ($validated['type'] === 'dm' && count($participantIds) === 1) {
            $existing = $user->conversations()
                ->where('type', 'dm')
                ->whereHas('participants', function ($q) use ($participantIds) {
                    $q->whereIn('user_id', $participantIds);
                })
                ->first();

            if ($existing) {
                return back();
            }
        }

        $conversation = Conversation::create([
            'type' => $validated['type'],
            'name' => $validated['name'] ?? null,
            'created_by' => $user->id,
        ]);

        // Add creator
        $conversation->participants()->attach($user->id, ['joined_at' => now()]);

        // Add other participants
        foreach ($participantIds as $participantId) {
            $conversation->participants()->attach($participantId, ['joined_at' => now()]);
        }

        return back();
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $user = auth()->user();

        // Gate: user must be participant
        abort_unless(
            $conversation->participants()->where('user_id', $user->id)->exists(),
            403
        );

        // Fetch messages with pagination
        $page = $request->query('page', 1);
        $perPage = 50;

        $messages = $conversation->messages()
            ->with('user:id,name')
            ->with('reactions.user:id')
            ->whereNull('deleted_at')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Mark conversation as read
        $conversation->participants()
            ->where('user_id', $user->id)
            ->update(['last_read_message_id' => $messages->first()?->id]);

        return response()->json([
            'messages' => $messages->items(),
            'pagination' => [
                'total' => $messages->total(),
                'per_page' => $messages->perPage(),
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
            ],
        ]);
    }
}
