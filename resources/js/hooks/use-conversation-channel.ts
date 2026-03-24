import { useEffect } from 'react';
import echo from '@/lib/echo';
import type {
    MessageSentPayload,
    MessageUpdatedPayload,
    MessageDeletedPayload,
    MessageReactionPayload,
    MessagePinnedPayload,
    ConversationReadPayload,
    TypingPayload,
} from '@/types/messaging';

export function useConversationChannel(
    conversationId: number | null,
    callbacks: {
        onMessage: (payload: MessageSentPayload) => void;
        onMessageUpdated: (payload: MessageUpdatedPayload) => void;
        onMessageDeleted: (payload: MessageDeletedPayload) => void;
        onReactionUpdated: (payload: MessageReactionPayload) => void;
        onMessagePinned: (payload: MessagePinnedPayload) => void;
        onConversationRead: (payload: ConversationReadPayload) => void;
        onTyping: (payload: TypingPayload) => void;
    },
) {
    useEffect(() => {
        if (!echo || !conversationId) return;

        const channel = echo.private('conversation.' + conversationId);

        channel.listen('.MessageSent', callbacks.onMessage);
        channel.listen('.MessageUpdated', callbacks.onMessageUpdated);
        channel.listen('.MessageDeleted', callbacks.onMessageDeleted);
        channel.listen('.MessageReactionUpdated', callbacks.onReactionUpdated);
        channel.listen('.MessagePinned', callbacks.onMessagePinned);
        channel.listen('.ConversationRead', callbacks.onConversationRead);
        channel.listenForWhisper('typing', callbacks.onTyping);

        return () => {
            if (echo) {
                echo.leave('conversation.' + conversationId);
            }
        };
    }, [conversationId, callbacks.onMessage, callbacks.onMessageUpdated, callbacks.onMessageDeleted, callbacks.onReactionUpdated, callbacks.onMessagePinned, callbacks.onConversationRead, callbacks.onTyping]);
}
