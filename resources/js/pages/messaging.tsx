import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { MessagingLeftPanel } from '@/components/messaging/messaging-left-panel';
import { MessagingRightPanel } from '@/components/messaging/messaging-right-panel';
import { MessageList } from '@/components/messaging/message-list';
import { MessageInputArea } from '@/components/messaging/message-input-area';
import { ConversationHeader } from '@/components/messaging/conversation-header';
import { PinnedMessagesBanner } from '@/components/messaging/pinned-messages-banner';
import { UserDirectoryModal } from '@/components/messaging/user-directory-modal';
import { useConversationChannel } from '@/hooks/use-conversation-channel';
import { useMessages } from '@/hooks/use-messages';
import { useTypingIndicator } from '@/hooks/use-typing-indicator';
import { useLobbyPresence } from '@/hooks/use-lobby-presence';
import { useUnreadCounts } from '@/hooks/use-unread-counts';
import AppLayout from '@/layouts/app-layout';
import { MessageCircle, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem, User } from '@/types';
import type { Conversation, Message, MessagingPageProps } from '@/types/messaging';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Messaging', href: '/messaging' },
];

declare global {
    interface Window {
        currentUserId: number;
    }
}

export default function Messaging({
    conversations: initialConversations,
    allUsers,
    broadcastConversationId,
}: MessagingPageProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    window.currentUserId = auth.user.id;

    const [conversations, setConversations] = useState<Conversation[]>(
        initialConversations,
    );
    const [activeConversationId, setActiveConversationId] = useState<
        number | null
    >(broadcastConversationId || null);
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);
    const [directoryOpen, setDirectoryOpen] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const {
        messages,
        isLoading: messagesLoading,
        hasMore,
        loadMessages,
        loadMore,
        appendMessage,
        updateMessage,
        deleteMessage,
        updateReactions,
        pinMessage,
    } = useMessages(activeConversationId);

    const { typingUsers, sendTyping } = useTypingIndicator(activeConversationId);
    const { onlineUsers } = useLobbyPresence();
    const { counts, markRead, handleMessageSent } = useUnreadCounts(
        conversations,
    );

    const [messageBody, setMessageBody] = useState('');
    const [sending, setSending] = useState(false);

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId,
    );

    const pinnedMessages = activeConversation
        ? activeConversation.type === 'broadcast'
            ? []
            : messages.filter((m) => m.is_pinned)
        : [];

    useEffect(() => {
        if (activeConversationId) {
            loadMessages(1);
            markRead(activeConversationId);
        }
    }, [activeConversationId, loadMessages, markRead]);

    useConversationChannel(activeConversationId, {
        onMessage: useCallback(
            (payload) => {
                appendMessage(payload);
                markRead(payload.conversation_id);
            },
            [appendMessage, markRead],
        ),
        onMessageUpdated: useCallback(
            (payload) => {
                updateMessage(payload.id, {
                    body: payload.body,
                    edited_at: payload.edited_at,
                });
            },
            [updateMessage],
        ),
        onMessageDeleted: useCallback(
            (payload) => {
                deleteMessage(payload.id);
            },
            [deleteMessage],
        ),
        onReactionUpdated: useCallback(
            (payload) => {
                updateReactions(payload.message_id, payload.reactions);
            },
            [updateReactions],
        ),
        onMessagePinned: useCallback(
            (payload) => {
                pinMessage(payload.message_id, payload.is_pinned);
            },
            [pinMessage],
        ),
        onConversationRead: useCallback(() => {}, []),
        onTyping: useCallback(() => {}, []),
    });

    const handleSendMessage = useCallback(async () => {
        if (!messageBody.trim() || !activeConversationId || sending) return;

        const body = messageBody;
        const replyId = replyingTo?.id ?? null;

        const optimisticMsg: Message = {
            id: -Date.now(),
            conversation_id: activeConversationId,
            user: {
                id: auth.user.id,
                name: auth.user.name,
                avatar: (auth.user as any).avatar,
            },
            reply_to_id: replyId,
            body,
            is_pinned: false,
            edited_at: null,
            deleted_at: null,
            created_at: new Date().toISOString(),
            reactions: [],
        };

        appendMessage(optimisticMsg);
        setMessageBody('');
        setReplyingTo(null);
        setSending(true);

        router.post(
            `/messaging/conversations/${activeConversationId}/messages`,
            { body, reply_to_id: replyId },
            {
                preserveScroll: true,
                onSuccess: () => loadMessages(1),
                onFinish: () => setSending(false),
            },
        );
    }, [messageBody, activeConversationId, replyingTo, sending, appendMessage, loadMessages, auth.user]);

    const handleNewDm = useCallback(() => setDirectoryOpen(true), []);

    const handleSelectUser = useCallback(
        (userId: number) => {
            router.post(
                '/messaging/conversations',
                { type: 'dm', participant_ids: [userId] },
                { preserveScroll: true },
            );
        },
        [],
    );

    const handleReaction = useCallback(
        (emoji: string, messageId: number) => {
            router.post(
                `/messaging/conversations/${activeConversationId}/messages/${messageId}/reactions`,
                { emoji },
                { preserveScroll: true },
            );
        },
        [activeConversationId],
    );

    const handleDelete = useCallback(
        (messageId: number) => {
            router.delete(
                `/messaging/conversations/${activeConversationId}/messages/${messageId}`,
                { preserveScroll: true },
            );
        },
        [activeConversationId],
    );

    const handlePin = useCallback(
        (messageId: number) => {
            router.post(
                `/messaging/conversations/${activeConversationId}/messages/${messageId}/pin`,
                {},
                { preserveScroll: true },
            );
        },
        [activeConversationId],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messaging" />

            <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-border/40 bg-background shadow-sm m-2">
                {/* Left Panel */}
                <div
                    className={`shrink-0 border-r border-border/40 transition-all duration-300 ease-in-out overflow-hidden ${
                        leftOpen ? 'w-72' : 'w-0'
                    }`}
                >
                    <MessagingLeftPanel
                        conversations={conversations}
                        activeConversationId={activeConversationId}
                        onSelectConversation={setActiveConversationId}
                        onNewDm={handleNewDm}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>

                {/* Center */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Toggle left panel button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLeftOpen(!leftOpen)}
                        className="absolute top-3 left-2 z-10 size-8 rounded-lg text-muted-foreground hover:text-foreground"
                        title={leftOpen ? 'Hide sidebar' : 'Show sidebar'}
                    >
                        {leftOpen ? (
                            <PanelLeftClose className="size-4" />
                        ) : (
                            <PanelLeft className="size-4" />
                        )}
                    </Button>

                    <ConversationHeader
                        conversation={activeConversation ?? null}
                        onToggleSearch={() => {}}
                        onToggleSidebar={() => setRightOpen(!rightOpen)}
                    />

                    {!activeConversation ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                            <div className="size-20 rounded-3xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 shadow-sm">
                                <MessageCircle className="size-9 text-primary/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground/70">
                                Welcome to Messaging
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
                                Select a conversation from the sidebar or start a new one to begin chatting with your team.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-5 rounded-xl"
                                onClick={handleNewDm}
                            >
                                Start a conversation
                            </Button>
                        </div>
                    ) : (
                        <>
                            {showPinnedOnly && pinnedMessages.length > 0 ? (
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="mx-auto max-w-2xl space-y-3">
                                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                                            Pinned Messages
                                        </h3>
                                        {pinnedMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className="rounded-xl border border-border/50 p-4 bg-card shadow-sm"
                                            >
                                                <p className="text-xs font-semibold text-foreground/80 mb-1.5">
                                                    {msg.user.name}
                                                </p>
                                                <p className="text-sm leading-relaxed">
                                                    {msg.body}
                                                </p>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() =>
                                                setShowPinnedOnly(false)
                                            }
                                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                        >
                                            Back to chat
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <PinnedMessagesBanner
                                        count={pinnedMessages.length}
                                        onShowPinned={() =>
                                            setShowPinnedOnly(true)
                                        }
                                        onDismiss={() => {}}
                                    />
                                    <MessageList
                                        messages={messages}
                                        isLoading={messagesLoading}
                                        hasMore={hasMore}
                                        onLoadMore={loadMore}
                                        currentUserId={auth.user.id}
                                        onDelete={handleDelete}
                                        onPin={handlePin}
                                        onReply={setReplyingTo}
                                        onReaction={handleReaction}
                                    />
                                </>
                            )}

                            <MessageInputArea
                                body={messageBody}
                                onBodyChange={setMessageBody}
                                onSend={handleSendMessage}
                                isLoading={sending}
                                typingUsers={typingUsers}
                                replyingTo={replyingTo}
                                onCancelReply={() => setReplyingTo(null)}
                            />
                        </>
                    )}
                </div>

                {/* Right Panel */}
                <div
                    className={`shrink-0 border-l border-border/40 transition-all duration-300 ease-in-out overflow-hidden ${
                        rightOpen ? 'w-72' : 'w-0'
                    }`}
                >
                    <MessagingRightPanel
                        conversation={activeConversation ?? null}
                        pinnedMessages={pinnedMessages}
                    />
                </div>
            </div>

            <UserDirectoryModal
                isOpen={directoryOpen}
                onClose={() => setDirectoryOpen(false)}
                users={allUsers}
                onSelectUser={handleSelectUser}
            />
        </AppLayout>
    );
}
