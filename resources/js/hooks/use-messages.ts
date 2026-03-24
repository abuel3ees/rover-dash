import { useCallback, useState } from 'react';
import type { Message } from '@/types/messaging';

export function useMessages(conversationId: number | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const loadMessages = useCallback(
        async (page: number = 1) => {
            if (!conversationId) return;

            setIsLoading(true);
            try {
                const response = await fetch(
                    `/messaging/conversations/${conversationId}?page=${page}`,
                );
                const data = await response.json();

                if (page === 1) {
                    setMessages(data.messages);
                } else {
                    setMessages((prev) => [...data.messages, ...prev]);
                }

                setCurrentPage(page);
                setTotalPages(data.pagination.last_page);
                setHasMore(page < data.pagination.last_page);
            } catch (error) {
                console.error('Error loading messages:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [conversationId],
    );

    const appendMessage = useCallback((message: Message) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    const updateMessage = useCallback((id: number, patch: Partial<Message>) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === id ? { ...msg, ...patch } : msg,
            ),
        );
    }, []);

    const deleteMessage = useCallback((id: number) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === id
                    ? { ...msg, body: '', deleted_at: new Date().toISOString() }
                    : msg,
            ),
        );
    }, []);

    const updateReactions = useCallback(
        (messageId: number, reactions: Message['reactions']) => {
            updateMessage(messageId, { reactions });
        },
        [updateMessage],
    );

    const pinMessage = useCallback(
        (messageId: number, isPinned: boolean) => {
            updateMessage(messageId, { is_pinned: isPinned });
        },
        [updateMessage],
    );

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading) {
            loadMessages(currentPage + 1);
        }
    }, [currentPage, hasMore, isLoading, loadMessages]);

    return {
        messages,
        isLoading,
        hasMore,
        loadMessages,
        loadMore,
        appendMessage,
        updateMessage,
        deleteMessage,
        updateReactions,
        pinMessage,
    };
}
