import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Conversation } from '@/types/messaging';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getPreview(conversation: Conversation): string {
    if (!conversation.latest_message) {
        return 'No messages';
    }

    const msg = conversation.latest_message;
    if (msg.body.length > 40) {
        return msg.body.substring(0, 40) + '...';
    }
    return msg.body;
}

export function ConversationListItem({
    conversation,
    isActive,
    onClick,
}: {
    conversation: Conversation;
    isActive: boolean;
    onClick: () => void;
}) {
    const isDm = conversation.type === 'dm';
    const isBroadcast = conversation.type === 'broadcast';
    const title = isBroadcast
        ? '📢 Team Broadcast'
        : isDm
          ? conversation.participants
              .filter((p) => p.id !== (window as any).currentUserId)
              .map((p) => p.name)
              .join(', ')
          : conversation.name || 'Group';

    const onlineParticipants = conversation.participants.filter(
        (p) => p.is_online,
    ).length;

    const hasUnread = conversation.unread_count > 0;

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between gap-2 ${
                isActive
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
            }`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p
                        className={`text-sm font-medium truncate ${
                            hasUnread ? 'font-bold' : ''
                        }`}
                    >
                        {title}
                    </p>
                    {!isBroadcast && onlineParticipants > 0 && (
                        <div className="size-2 rounded-full bg-green-500 shrink-0" />
                    )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                    {getPreview(conversation)}
                </p>
            </div>

            {hasUnread && (
                <Badge
                    variant="default"
                    className="shrink-0"
                >
                    {conversation.unread_count}
                </Badge>
            )}
        </button>
    );
}
