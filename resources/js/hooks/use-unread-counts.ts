import { useCallback, useState } from 'react';
import type {
    Conversation,
    MessageSentPayload,
    ConversationReadPayload,
} from '@/types/messaging';

export function useUnreadCounts(initialConversations: Conversation[]) {
    const [counts, setCounts] = useState<Record<number, number>>(
        initialConversations.reduce(
            (acc, conv) => {
                acc[conv.id] = conv.unread_count;
                return acc;
            },
            {} as Record<number, number>,
        ),
    );

    const incrementUnread = useCallback((conversationId: number) => {
        setCounts((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || 0) + 1,
        }));
    }, []);

    const markRead = useCallback((conversationId: number) => {
        setCounts((prev) => ({
            ...prev,
            [conversationId]: 0,
        }));
    }, []);

    const handleMessageSent = useCallback(
        (message: MessageSentPayload, activeConversationId: number | null) => {
            // Only increment if message is from another user and not actively viewing
            if (activeConversationId !== message.conversation_id) {
                incrementUnread(message.conversation_id);
            }
        },
        [incrementUnread],
    );

    const handleConversationRead = useCallback(
        (payload: ConversationReadPayload, currentUserId: number) => {
            // If another user read, update their read status (not affecting unread count)
            // If current user's read event is broadcasted back, no need to update counts
            // (already marked as read in markRead call)
        },
        [],
    );

    return { counts, incrementUnread, markRead, handleMessageSent, handleConversationRead };
}
