import { useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
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
    if (isSameDay(dateStr, today.toISOString())) return 'Today';
    if (isSameDay(dateStr, yesterday.toISOString())) return 'Yesterday';
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
        if (isAtBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const { scrollHeight, scrollTop, clientHeight } =
            containerRef.current;
        isAtBottomRef.current =
            scrollHeight - scrollTop - clientHeight < 100;
        if (scrollTop < 100 && hasMore && !isLoading) {
            onLoadMore();
        }
    }, [hasMore, isLoading, onLoadMore]);

    let lastDate = '';

    if (messages.length === 0 && !isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="size-16 rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                    <MessageCircle className="size-7 text-primary/50" />
                </div>
                <p className="text-base font-medium text-foreground/70">
                    No messages yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                    Send a message to start the conversation
                </p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
        >
            <div className="mx-auto max-w-3xl px-5 py-4">
                {/* Load more indicator */}
                {isLoading && (
                    <div className="flex justify-center py-3">
                        <Loader2 className="size-5 text-muted-foreground animate-spin" />
                    </div>
                )}

                {messages.map((msg, idx) => {
                    const isOwn = msg.user.id === currentUserId;
                    const showAvatar =
                        idx === 0 ||
                        messages[idx - 1].user.id !== msg.user.id;
                    const showDate =
                        !lastDate ||
                        !isSameDay(lastDate, msg.created_at);
                    if (showDate) lastDate = msg.created_at;

                    return (
                        <div key={msg.id}>
                            {showDate && (
                                <div className="flex items-center gap-4 py-5">
                                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 bg-background px-2">
                                        {formatDate(msg.created_at)}
                                    </span>
                                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
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
