import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Pin, Users, Clock } from 'lucide-react';
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

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.floor(
        (now.getTime() - date.getTime()) / 60000,
    );
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
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
            <div className="flex items-center justify-center h-full text-center p-4">
                <div className="space-y-2">
                    <Users className="size-8 text-muted-foreground/30 mx-auto" />
                    <p className="text-xs text-muted-foreground">
                        Select a conversation
                    </p>
                </div>
            </div>
        );
    }

    const currentUserId = (window as any).currentUserId;
    const participants = conversation.participants.filter(
        (p) => p.id !== currentUserId,
    );
    const onlineCount = participants.filter((p) => p.is_online).length;

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-card/30">
            {/* Members Section */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-muted-foreground" />
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Members
                        </h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                        {onlineCount} online
                    </span>
                </div>
                <div className="space-y-0.5">
                    {participants.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-accent/60 transition-colors"
                        >
                            <div className="relative">
                                <Avatar className="size-7 ring-1 ring-border/50">
                                    <AvatarFallback className="bg-linear-to-br from-secondary to-muted text-[10px] font-semibold text-foreground/60">
                                        {getInitials(p.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background ${
                                        p.is_online
                                            ? 'bg-emerald-500'
                                            : 'bg-muted-foreground/30'
                                    }`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate leading-tight">
                                    {p.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                    {p.is_online ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            Online
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-2.5" />
                                            {timeAgo(p.last_active_at)}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
                <div className="border-t border-border/50 p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                        <Pin className="size-3.5 text-muted-foreground" />
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Pinned
                        </h3>
                        <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                            {pinnedMessages.length}
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {pinnedMessages.map((msg) => (
                            <button
                                key={msg.id}
                                onClick={() =>
                                    onScrollToMessage?.(msg.id)
                                }
                                className="w-full text-left p-2.5 rounded-lg border border-border/40 bg-background/50 hover:bg-accent/60 transition-all group/pin"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[11px] font-semibold text-foreground/80">
                                        {msg.user.name}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                                        {formatTime(msg.created_at)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                    {msg.body}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
