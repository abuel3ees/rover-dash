import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Conversation, Message } from '@/types/messaging';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function MessagingRightPanel({
    conversation,
    pinnedMessages,
    onScrollToMessage,
}: {
    conversation: Conversation | null;
    pinnedMessages: Message[];
    onScrollToMessage?: (id: number) => void;
}) {
    if (!conversation) {
        return (
            <div className="flex items-center justify-center h-full text-center">
                <p className="text-sm text-muted-foreground">
                    Select a conversation
                </p>
            </div>
        );
    }

    const participants = conversation.participants.filter(
        (p) => p.id !== (window as any).currentUserId,
    );

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {/* Participants */}
            <div className="p-4">
                <h3 className="text-sm font-semibold mb-3">Members</h3>
                <div className="space-y-2">
                    {participants.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-2 rounded-md p-2 hover:bg-muted"
                        >
                            <Avatar className="size-6">
                                <AvatarFallback className="bg-primary/10 text-xs">
                                    {getInitials(p.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                    {p.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {p.is_online
                                        ? 'Online'
                                        : 'Offline'}
                                </p>
                            </div>
                            {p.is_online && (
                                <div className="size-2 rounded-full bg-green-500" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {pinnedMessages.length > 0 && (
                <>
                    <Separator />
                    <div className="p-4">
                        <h3 className="text-sm font-semibold mb-3">
                            Pinned ({pinnedMessages.length})
                        </h3>
                        <div className="space-y-2">
                            {pinnedMessages.map((msg) => (
                                <button
                                    key={msg.id}
                                    onClick={() =>
                                        onScrollToMessage?.(msg.id)
                                    }
                                    className="w-full text-left text-xs p-2 rounded hover:bg-muted bg-muted/30 transition-colors"
                                >
                                    <p className="font-medium text-foreground mb-1">
                                        {msg.user.name}
                                    </p>
                                    <p className="text-muted-foreground line-clamp-2">
                                        {msg.body}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatTime(msg.created_at)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
