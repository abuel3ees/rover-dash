import { Search, PanelRight, Radio, Users, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Conversation } from '@/types/messaging';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function getConversationTitle(
    conversation: Conversation,
    currentUserId: number,
): string {
    if (conversation.type === 'broadcast') return 'Team Broadcast';
    if (conversation.type === 'dm') {
        return (
            conversation.participants
                .filter((p) => p.id !== currentUserId)
                .map((p) => p.name)
                .join(', ') || 'Direct Message'
        );
    }
    return conversation.name || 'Group Chat';
}

export function ConversationHeader({
    conversation,
    onToggleSearch,
    onToggleSidebar,
}: {
    conversation: Conversation | null;
    onToggleSearch?: () => void;
    onToggleSidebar?: () => void;
}) {
    if (!conversation) {
        return (
            <div className="h-16 flex items-center px-5 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground">
                    Select a conversation to start messaging
                </p>
            </div>
        );
    }

    const currentUserId = (window as any).currentUserId;
    const title = getConversationTitle(conversation, currentUserId);
    const onlineCount = conversation.participants.filter(
        (p) => p.is_online,
    ).length;
    const totalCount = conversation.participants.length;
    const isBroadcast = conversation.type === 'broadcast';
    const isDm = conversation.type === 'dm';

    const partner = isDm
        ? conversation.participants.find((p) => p.id !== currentUserId)
        : null;

    return (
        <div className="h-16 flex items-center justify-between px-5 border-b border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                {/* Conversation avatar */}
                {isBroadcast ? (
                    <div className="flex items-center justify-center size-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                        <Radio className="size-4" />
                    </div>
                ) : isDm && partner ? (
                    <div className="relative">
                        <Avatar className="size-9 ring-2 ring-background">
                            <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary text-xs font-semibold">
                                {getInitials(partner.name)}
                            </AvatarFallback>
                        </Avatar>
                        {partner.is_online && (
                            <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center size-9 rounded-xl bg-linear-to-br from-violet-400 to-purple-600 text-white shadow-sm">
                        <Users className="size-4" />
                    </div>
                )}

                <div>
                    <h2 className="text-sm font-semibold leading-tight">
                        {title}
                    </h2>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                        {isDm && partner
                            ? partner.is_online
                                ? 'Online'
                                : 'Offline'
                            : `${onlineCount} online / ${totalCount} members`}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {onToggleSearch && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                        onClick={onToggleSearch}
                        title="Search messages"
                    >
                        <Search className="size-4" />
                    </Button>
                )}
                {onToggleSidebar && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                        onClick={onToggleSidebar}
                        title="Toggle details"
                    >
                        <PanelRight className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
