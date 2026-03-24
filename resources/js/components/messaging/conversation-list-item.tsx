import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Radio, Hash, Users } from 'lucide-react';
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
    if (!conversation.latest_message) return 'No messages yet';
    const msg = conversation.latest_message;
    const prefix = msg.user ? `${msg.user.name.split(' ')[0]}: ` : '';
    const body = msg.body || 'Message deleted';
    const full = prefix + body;
    return full.length > 45 ? full.substring(0, 45) + '...' : full;
}

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
    const isGroup = conversation.type === 'group';

    const partner = isDm
        ? conversation.participants.find(
              (p) => p.id !== (window as any).currentUserId,
          )
        : null;

    const title = isBroadcast
        ? 'Team Broadcast'
        : isDm
          ? partner?.name || 'Direct Message'
          : conversation.name || 'Group Chat';

    const hasUnread = conversation.unread_count > 0;
    const isOnline = isDm && partner?.is_online;

    return (
        <button
            onClick={onClick}
            className={`group w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                isActive
                    ? 'bg-primary/10 shadow-sm ring-1 ring-primary/20'
                    : 'hover:bg-accent/60'
            }`}
        >
            {/* Avatar / Icon */}
            <div className="relative shrink-0">
                {isBroadcast ? (
                    <div className="flex items-center justify-center size-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                        <Radio className="size-4" />
                    </div>
                ) : isGroup ? (
                    <div className="flex items-center justify-center size-10 rounded-xl bg-linear-to-br from-violet-400 to-purple-600 text-white shadow-sm">
                        <Users className="size-4" />
                    </div>
                ) : (
                    <Avatar className="size-10 ring-2 ring-background shadow-sm">
                        <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary text-xs font-semibold">
                            {getInitials(partner?.name || 'DM')}
                        </AvatarFallback>
                    </Avatar>
                )}
                {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p
                        className={`text-sm truncate ${
                            hasUnread
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-foreground/80'
                        }`}
                    >
                        {title}
                    </p>
                    {conversation.latest_message && (
                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                            {formatRelativeTime(
                                conversation.latest_message.created_at,
                            )}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                        className={`text-xs truncate ${
                            hasUnread
                                ? 'text-foreground/70'
                                : 'text-muted-foreground'
                        }`}
                    >
                        {getPreview(conversation)}
                    </p>
                    {hasUnread && (
                        <span className="flex items-center justify-center shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tabular-nums">
                            {conversation.unread_count > 99
                                ? '99+'
                                : conversation.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
}
