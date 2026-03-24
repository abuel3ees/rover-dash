import { Plus, Search, Radio, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <div className="flex flex-col h-full bg-card/30">
            {/* Header */}
            <div className="p-4 pb-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold tracking-tight">Messages</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        onClick={onNewDm}
                        title="New conversation"
                    >
                        <Plus className="size-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-8 pl-8 text-xs bg-muted/50 border-0 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/30"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
                {/* Broadcast */}
                {broadcast && searchQuery === '' && (
                    <div>
                        <div className="flex items-center gap-1.5 px-2 mb-1.5">
                            <Radio className="size-3 text-muted-foreground" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Broadcast
                            </span>
                        </div>
                        <ConversationListItem
                            conversation={broadcast}
                            isActive={activeConversationId === broadcast.id}
                            onClick={() => onSelectConversation(broadcast.id)}
                        />
                    </div>
                )}

                {/* DMs */}
                {(searchQuery === '' ||
                    dms.some((d) => filtered.includes(d))) && (
                    <div>
                        <div className="flex items-center justify-between px-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="size-3 text-muted-foreground" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Direct Messages
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 rounded-md hover:bg-primary/10 hover:text-primary"
                                onClick={onNewDm}
                                title="New DM"
                            >
                                <Plus className="size-3" />
                            </Button>
                        </div>
                        <div className="space-y-0.5">
                            {(searchQuery === ''
                                ? dms
                                : filtered.filter((c) => c.type === 'dm')
                            ).map((dm) => (
                                <ConversationListItem
                                    key={dm.id}
                                    conversation={dm}
                                    isActive={activeConversationId === dm.id}
                                    onClick={() => onSelectConversation(dm.id)}
                                />
                            ))}
                            {dms.length === 0 && (
                                <button
                                    onClick={onNewDm}
                                    className="w-full flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground hover:text-primary transition-colors rounded-xl border border-dashed border-border/60 hover:border-primary/30 hover:bg-primary/5"
                                >
                                    <Plus className="size-3.5" />
                                    Start a conversation
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Groups */}
                {(searchQuery === '' ||
                    groups.some((g) => filtered.includes(g))) &&
                    groups.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between px-2 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Users className="size-3 text-muted-foreground" />
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Groups
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                {(searchQuery === ''
                                    ? groups
                                    : filtered.filter(
                                          (c) => c.type === 'group',
                                      )
                                ).map((group) => (
                                    <ConversationListItem
                                        key={group.id}
                                        conversation={group}
                                        isActive={
                                            activeConversationId === group.id
                                        }
                                        onClick={() =>
                                            onSelectConversation(group.id)
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                {filtered.length === 0 && searchQuery !== '' && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Search className="size-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">
                            No results for "{searchQuery}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
