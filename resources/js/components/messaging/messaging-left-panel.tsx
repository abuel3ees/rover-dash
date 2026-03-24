import { Plus, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ConversationListItem } from './conversation-list-item';
import type { Conversation } from '@/types/messaging';

export function MessagingLeftPanel({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewDm,
    searchQuery,
    onSearchChange,
}: {
    conversations: Conversation[];
    activeConversationId: number | null;
    onSelectConversation: (id: number) => void;
    onNewDm: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}) {
    const broadcast = conversations.find((c) => c.type === 'broadcast');
    const dms = conversations.filter((c) => c.type === 'dm');
    const groups = conversations.filter((c) => c.type === 'group');

    const filtered = conversations.filter(
        (c) =>
            searchQuery === '' ||
            c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.participants.some((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
    );

    return (
        <div className="flex flex-col h-full gap-4 p-4">
            {/* Search */}
            <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8"
            />

            {/* Broadcast */}
            {broadcast && searchQuery === '' && (
                <>
                    <div>
                        <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                            BROADCAST
                        </h3>
                        <ConversationListItem
                            conversation={broadcast}
                            isActive={activeConversationId === broadcast.id}
                            onClick={() =>
                                onSelectConversation(broadcast.id)
                            }
                        />
                    </div>
                    <Separator />
                </>
            )}

            {/* DMs */}
            {(searchQuery === '' || dms.some((d) => filtered.includes(d))) && (
                <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground">
                            DIRECT MESSAGES
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={onNewDm}
                            title="New DM"
                        >
                            <Plus className="size-3" />
                        </Button>
                    </div>
                    <div className="space-y-1">
                        {(searchQuery === '' ? dms : filtered.filter((c) => c.type === 'dm')).map(
                            (dm) => (
                                <ConversationListItem
                                    key={dm.id}
                                    conversation={dm}
                                    isActive={activeConversationId === dm.id}
                                    onClick={() =>
                                        onSelectConversation(dm.id)
                                    }
                                />
                            ),
                        )}
                    </div>
                </div>
            )}

            {/* Groups */}
            {(searchQuery === '' ||
                groups.some((g) => filtered.includes(g))) && (
                <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-xs font-semibold text-muted-foreground">
                            GROUP CHATS
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={onNewDm}
                            title="New Group"
                        >
                            <Plus className="size-3" />
                        </Button>
                    </div>
                    <div className="space-y-1">
                        {(searchQuery === '' ? groups : filtered.filter((c) => c.type === 'group')).map(
                            (group) => (
                                <ConversationListItem
                                    key={group.id}
                                    conversation={group}
                                    isActive={activeConversationId === group.id}
                                    onClick={() =>
                                        onSelectConversation(group.id)
                                    }
                                />
                            ),
                        )}
                    </div>
                </div>
            )}

            {filtered.length === 0 && searchQuery !== '' && (
                <p className="text-xs text-muted-foreground text-center py-4">
                    No conversations found
                </p>
            )}
        </div>
    );
}
