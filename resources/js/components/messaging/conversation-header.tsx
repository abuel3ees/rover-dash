import { Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/types/messaging';

function getConversationTitle(
    conversation: Conversation,
    currentUserId: number,
): string {
    if (conversation.type === 'broadcast') {
        return '📢 Team Broadcast';
    }

    if (conversation.type === 'dm') {
        return (
            conversation.participants
                .filter((p) => p.id !== currentUserId)
                .map((p) => p.name)
                .join(', ') || 'Direct Message'
        );
    }

    return conversation.name || 'Group';
}

function getOnlineCount(conversation: Conversation): number {
    return conversation.participants.filter((p) => p.is_online).length;
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
            <div className="border-b border-border bg-card px-4 py-3">
                <p className="text-sm text-muted-foreground">
                    Select a conversation
                </p>
            </div>
        );
    }

    const title = getConversationTitle(
        conversation,
        (window as any).currentUserId,
    );
    const onlineCount = getOnlineCount(conversation);

    return (
        <div className="border-b border-border bg-card px-4 py-3">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-semibold">{title}</h2>
                    {onlineCount > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {onlineCount}{' '}
                            {onlineCount === 1
                                ? 'person'
                                : 'people'}{' '}
                            online
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {onToggleSearch && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={onToggleSearch}
                            title="Search"
                        >
                            <Search className="size-4" />
                        </Button>
                    )}
                    {onToggleSidebar && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={onToggleSidebar}
                            title="Show details"
                        >
                            <Info className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
