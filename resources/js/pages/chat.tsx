import { Head, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    useChatChannel,
    type ChatMessagePayload,
} from '@/hooks/use-chat-channel';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chat', href: '/chat' },
];

type ChatMessage = {
    id: number;
    user_id: number;
    body: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

export default function Chat({
    messages: initialMessages,
}: {
    messages: ChatMessage[];
}) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        body: '',
    });

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const onMessage = useCallback(
        (payload: ChatMessagePayload) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: payload.id,
                    user_id: payload.user.id,
                    body: payload.body,
                    created_at: payload.created_at,
                    user: payload.user,
                },
            ]);
        },
        [],
    );

    useChatChannel(onMessage);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.body.trim()) return;

        // Optimistically add the message
        const optimisticMsg: ChatMessage = {
            id: Date.now(),
            user_id: auth.user.id,
            body: data.body,
            created_at: new Date().toISOString(),
            user: {
                id: auth.user.id,
                name: auth.user.name,
                avatar: auth.user.avatar,
            },
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        post('/chat', {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                inputRef.current?.focus();
            },
        });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    // Group messages by date
    let lastDate = '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />

            <div className="flex h-full flex-1 flex-col">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="mx-auto max-w-3xl space-y-1">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <p className="text-lg font-medium">
                                    No messages yet
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Start the conversation with your team!
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => {
                            const isCurrentUser =
                                msg.user_id === auth.user.id;
                            const showAvatar =
                                idx === 0 ||
                                messages[idx - 1].user_id !== msg.user_id;
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
                                    <div
                                        className={`flex gap-3 ${showAvatar ? 'mt-4' : 'mt-0.5'} ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                                    >
                                        {showAvatar ? (
                                            <Avatar className="mt-1 size-8 shrink-0">
                                                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                                    {getInitials(
                                                        msg.user.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className="size-8 shrink-0" />
                                        )}
                                        <div
                                            className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}
                                        >
                                            {showAvatar && (
                                                <div
                                                    className={`mb-1 flex items-center gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
                                                >
                                                    <span className="text-xs font-medium">
                                                        {isCurrentUser
                                                            ? 'You'
                                                            : msg.user.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTime(
                                                            msg.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div
                                                className={`inline-block rounded-2xl px-4 py-2 text-sm ${
                                                    isCurrentUser
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                }`}
                                            >
                                                {msg.body}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-border bg-card p-4">
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto flex max-w-3xl gap-2"
                    >
                        <Input
                            ref={inputRef}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            autoComplete="off"
                            className="flex-1"
                            disabled={processing}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={processing || !data.body.trim()}
                        >
                            <Send className="size-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
