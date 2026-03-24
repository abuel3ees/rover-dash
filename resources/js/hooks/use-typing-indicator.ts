import { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from './use-debounce';
import echo from '@/lib/echo';
import type { MessageUser } from '@/types/messaging';

export function useTypingIndicator(conversationId: number | null) {
    const [typingUsers, setTypingUsers] = useState<MessageUser[]>([]);
    const typingTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
    const lastSentRef = useRef<number>(0);
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!echo || !conversationId) return;

        channelRef.current = echo.private('conversation.' + conversationId);

        return () => {
            // Clean up timeouts
            typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
            typingTimeoutsRef.current.clear();
        };
    }, [conversationId]);

    const sendTyping = useCallback((user: MessageUser) => {
        if (!channelRef.current || !conversationId) return;

        const now = Date.now();
        // Debounce: send at most once per 2 seconds
        if (now - lastSentRef.current < 2000) return;

        lastSentRef.current = now;

        try {
            channelRef.current.whisper('typing', {
                user,
                conversation_id: conversationId,
            });
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    }, [conversationId]);

    const handleTypingReceived = useCallback((payload: { user: MessageUser }) => {
        setTypingUsers((prev) => {
            // Add or update user in typing list
            const filtered = prev.filter((u) => u.id !== payload.user.id);
            return [...filtered, payload.user];
        });

        // Clear existing timeout for this user
        const existingTimeout = typingTimeoutsRef.current.get(payload.user.id);
        if (existingTimeout) clearTimeout(existingTimeout);

        // Set timeout to remove user after 3 seconds
        const timeout = setTimeout(() => {
            setTypingUsers((prev) =>
                prev.filter((u) => u.id !== payload.user.id),
            );
            typingTimeoutsRef.current.delete(payload.user.id);
        }, 3000);

        typingTimeoutsRef.current.set(payload.user.id, timeout);
    }, []);

    useEffect(() => {
        if (!channelRef.current) return;

        try {
            channelRef.current.listenForWhisper('typing', handleTypingReceived);
        } catch (error) {
            // Echo might not support listenForWhisper on private channels
        }
    }, [handleTypingReceived]);

    return { typingUsers, sendTyping };
}
