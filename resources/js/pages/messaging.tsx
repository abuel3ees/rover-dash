import { Head, useForm, usePage } from '@inertiajs/react';
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
import type { BreadcrumbItem, User } from '@/types';
import type { Conversation, Message, MessagingPageProps } from '@/types/messaging';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Messaging', href: '/messaging' },
];

// Store currentUserId in window for components to access
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
    const [rightOpen, setRightOpen] = useState(true);
    const [showPinnedOnly, setShowPinnedOnly] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
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

    const { data, setData, post, processing, reset } = useForm({
        body: '',
        reply_to_id: 0,
    });

    const activeConversation = conversations.find(
        (c) => c.id === activeConversationId,
    );

    const pinnedMessages = activeConversation
        ? activeConversation.type === 'broadcast'
            ? []
            : messages.filter((m) => m.is_pinned)
        : [];

    // Load messages when conversation changes
    useEffect(() => {
        if (activeConversationId) {
            loadMessages(1);
            markRead(activeConversationId);
        }
    }, [activeConversationId, loadMessages, markRead]);

    // Subscription to realtime events
    useConversationChannel(
        activeConversationId,
        {
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
            onConversationRead: useCallback(() => {
                // Update read receipts (not affecting unread count)
            }, []),
            onTyping: useCallback(() => {
                // Typing indicator already handled by useTypingIndicator
            }, []),
        },
    );

    const handleSendMessage = useCallback(async () => {
        if (!data.body.trim() || !activeConversationId) return;

        const optimisticMsg: Message = {
            id: -Date.now(),
            conversation_id: activeConversationId,
            user: {
                id: auth.user.id,
                name: auth.user.name,
                avatar: auth.user.avatar,
            },
            reply_to_id: replyingTo?.id ?? null,
            body: data.body,
            is_pinned: false,
            edited_at: null,
            deleted_at: null,
            created_at: new Date().toISOString(),
            reactions: [],
        };

        appendMessage(optimisticMsg);
        setData({
            body: '',
            reply_to_id: replyingTo?.id ?? 0,
        });
        setReplyingTo(null);

        post(`/messaging/conversations/${activeConversationId}/messages`, {
            data: {
                body: optimisticMsg.body,
                reply_to_id: replyingTo?.id ?? null,
            },
            preserveScroll: true,
            onSuccess: () => {
                loadMessages(1);
            },
        });
    }, [data.body, activeConversationId, replyingTo, appendMessage, post, loadMessages, setData, auth.user]);

    const handleNewDm = useCallback(() => {
        setDirectoryOpen(true);
    }, []);

    const handleSelectUser = useCallback(
        async (userId: number) => {
            // Create or find DM
            post(
                '/messaging/conversations',
                {
                    type: 'dm',
                    participant_ids: [userId],
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        loadMessages(1);
                    },
                },
            );
        },
        [post, loadMessages],
    );

    const handleReaction = useCallback(
        (emoji: string, messageId: number) => {
            post(`/messaging/conversations/${activeConversationId}/messages/${messageId}/reactions`, {
                emoji,
                preserveScroll: true,
            });
        },
        [activeConversationId, post],
    );

    const handleDelete = useCallback(
        (messageId: number) => {
            post(
                `/messaging/conversations/${activeConversationId}/messages/${messageId}`,
                {
                    _method: 'DELETE',
                    preserveScroll: true,
                },
            );
        },
        [activeConversationId, post],
    );

    const handlePin = useCallback(
        (messageId: number) => {
            post(`/messaging/conversations/${activeConversationId}/messages/${messageId}/pin`, {
                preserveScroll: true,
            });
        },
        [activeConversationId, post],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messaging" />

            <div className="flex h-full flex-1 gap-0">
                {/* Left Panel */}
                <div
                    className={`shrink-0 border-r border-border transition-all duration-200 overflow-hidden ${
                        leftOpen ? 'w-64' : 'w-0'
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

                {/* Center Panel */}
                <div className="flex-1 flex flex-col">
                    <ConversationHeader
                        conversation={activeConversation ?? null}
                        onToggleSearch={() => setSearchOpen(!searchOpen)}
                        onToggleSidebar={() => setRightOpen(!rightOpen)}
                    />

                    {showPinnedOnly && pinnedMessages.length > 0 ? (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="mx-auto max-w-3xl space-y-4">
                                <h3 className="font-semibold">
                                    Pinned Messages
                                </h3>
                                {pinnedMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="rounded-lg border border-border p-4 bg-muted/30"
                                    >
                                        <p className="text-sm font-medium mb-2">
                                            {msg.user.name}
                                        </p>
                                        <p className="text-sm">{msg.body}</p>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setShowPinnedOnly(false)}
                                    className="text-sm text-primary hover:underline"
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
                        body={data.body}
                        onBodyChange={(body) => setData('body', body)}
                        onSend={handleSendMessage}
                        isLoading={processing}
                        typingUsers={typingUsers}
                        replyingTo={replyingTo}
                        onCancelReply={() => setReplyingTo(null)}
                    />
                </div>

                {/* Right Panel */}
                <div
                    className={`shrink-0 border-l border-border transition-all duration-200 overflow-hidden ${
                        rightOpen ? 'w-72' : 'w-0'
                    }`}
                >
                    <MessagingRightPanel
                        conversation={activeConversation ?? null}
                        pinnedMessages={pinnedMessages}
                    />
                </div>
            </div>

            {/* User Directory Modal */}
            <UserDirectoryModal
                isOpen={directoryOpen}
                onClose={() => setDirectoryOpen(false)}
                users={allUsers}
                onSelectUser={handleSelectUser}
            />
        </AppLayout>
    );
}
