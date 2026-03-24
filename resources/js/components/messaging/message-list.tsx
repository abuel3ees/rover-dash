import { useEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './message-bubble';
import type { Message } from '@/types/messaging';

function isSameDay(d1: string, d2: string): boolean {
    const a = new Date(d1);
    const b = new Date(d2);
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(dateStr, today.toISOString())) {
        return 'Today';
    }
    if (isSameDay(dateStr, yesterday.toISOString())) {
        return 'Yesterday';
    }
    return date.toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

export function MessageList({
    messages,
    isLoading,
    hasMore,
    onLoadMore,
    currentUserId,
    onEdit,
    onDelete,
    onPin,
    onReply,
    onReaction,
}: {
    messages: Message[];
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    currentUserId: number;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onPin?: (id: number) => void;
    onReply?: (msg: Message) => void;
    onReaction?: (emoji: string, messageId: number) => void;
}) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef(true);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
        isAtBottomRef.current =
            scrollHeight - scrollTop - clientHeight < 100;

        // Load more when near top
        if (scrollTop < 100 && hasMore && !isLoading) {
            onLoadMore();
        }
    }, [hasMore, isLoading, onLoadMore]);

    let lastDate = '';

    if (messages.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-lg font-medium">
                    No messages yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Start the conversation!
                </p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4"
        >
            <div className="mx-auto max-w-3xl space-y-1">
                {messages.map((msg, idx) => {
                    const isOwn = msg.user.id === currentUserId;
                    const showAvatar =
                        idx === 0 ||
                        messages[idx - 1].user.id !== msg.user.id;
                    const showDate =
                        !lastDate ||
                        !isSameDay(lastDate, msg.created_at);

                    if (showDate) {
                        lastDate = msg.created_at;
                    }

                    return (
                        <div key={msg.id}>
                            {showDate && (
                                <div className="flex items-center gap-4 py-4">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(msg.created_at)}
                                    </span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                            )}

                            <MessageBubble
                                message={msg}
                                isOwn={isOwn}
                                showAvatar={showAvatar}
                                currentUserId={currentUserId}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onPin={onPin}
                                onReply={onReply}
                                onReactionClick={(emoji) =>
                                    onReaction?.(emoji, msg.id)
                                }
                            />
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
