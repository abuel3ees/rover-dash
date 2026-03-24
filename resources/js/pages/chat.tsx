import { Head, useForm, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    useChatChannel,
    type ChatMessagePayload,
    type PresenceUser,
} from '@/hooks/use-chat-channel';
import { useWhisperChannel, type WhisperPayload } from '@/hooks/use-whisper-channel';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User } from '@/types';
import type { Rover, TelemetryData } from '@/types/rover';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Chat', href: '/chat' },
];

type ChatMessage = ChatMessagePayload & { isWhisper?: boolean; from?: 'sent' | 'received' };

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
    rover,
    latestBattery,
    latestTemp,
}: {
    rover: Rover | null;
    latestBattery: TelemetryData | null;
    latestTemp: TelemetryData | null;
}) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [members, setMembers] = useState<PresenceUser[]>([]);
    const [whisperWith, setWhisperWith] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        body: '',
        recipient_id: 0,
    });

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const onMessage = useCallback((payload: ChatMessagePayload) => {
        setMessages((prev) => [...prev, { ...payload, isWhisper: false }]);
    }, []);

    const onWhisper = useCallback((payload: WhisperPayload) => {
        setMessages((prev) => [
            ...prev,
            {
                id: payload.id,
                user: payload.sender,
                body: payload.body,
                created_at: payload.created_at,
                isWhisper: true,
                from: 'received',
            },
        ]);
    }, []);

    const onMembersUpdate = useCallback((newMembers: PresenceUser[]) => {
        setMembers(newMembers);
    }, []);

    useChatChannel(onMessage, onMembersUpdate);
    useWhisperChannel(auth.user.id, onWhisper);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!data.body.trim()) return;

        const optimisticMsg: ChatMessage = {
            id: 'temp-' + Date.now(),
            user: {
                id: auth.user.id,
                name: auth.user.name,
            },
            body: data.body,
            created_at: new Date().toISOString(),
            isWhisper: whisperWith !== null,
            from: 'sent',
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        if (whisperWith !== null) {
            post('/chat/whisper', {
                data: { body: data.body, recipient_id: whisperWith },
                preserveScroll: true,
                onSuccess: () => {
                    reset('body');
                    inputRef.current?.focus();
                },
            });
        } else {
            post('/chat', {
                preserveScroll: true,
                onSuccess: () => {
                    reset('body');
                    inputRef.current?.focus();
                },
            });
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }

    const otherMembers = members.filter((m) => m.id !== auth.user.id);

    let lastDate = '';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chat" />

            <div className="flex h-full flex-1 gap-4 p-4">
                {/* Left: People Panel */}
                <div className="w-48 shrink-0 border-r border-border pr-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                            Online ({members.length})
                        </h3>
                        <div className="space-y-2">
                            {/* You */}
                            <div className="flex items-center gap-2 rounded-md bg-primary/5 p-2">
                                <Avatar className="size-6">
                                    <AvatarFallback className="bg-primary/20 text-xs text-primary">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">You</p>
                                </div>
                            </div>

                            {/* Other members */}
                            {otherMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-2 rounded-md p-2 hover:bg-muted group"
                                >
                                    <Avatar className="size-6">
                                        <AvatarFallback className="bg-primary/10 text-xs">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">
                                            {member.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setWhisperWith(member.id);
                                            inputRef.current?.focus();
                                        }}
                                        className="text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 bg-primary/20 text-primary hover:bg-primary/30 transition-opacity"
                                    >
                                        DM
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Chat Messages */}
                <div className="flex-1 flex flex-col">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 border-b border-border">
                        <div className="mx-auto max-w-3xl space-y-1">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <p className="text-lg font-medium">No messages yet</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Start the conversation with your team!
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, idx) => {
                                const isCurrentUser = msg.user.id === auth.user.id;
                                const showAvatar =
                                    idx === 0 || messages[idx - 1].user.id !== msg.user.id;
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
                                                        {getInitials(msg.user.name)}
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
                                                            {isCurrentUser ? 'You' : msg.user.name}
                                                        </span>
                                                        {msg.isWhisper && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs h-5"
                                                            >
                                                                {msg.from === 'sent'
                                                                    ? 'DM Sent'
                                                                    : 'DM'}
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTime(msg.created_at)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div
                                                    className={`inline-block rounded-2xl px-4 py-2 text-sm ${
                                                        msg.isWhisper
                                                            ? isCurrentUser
                                                                ? 'bg-purple-500/20 text-purple-900 dark:text-purple-100 italic'
                                                                : 'bg-purple-400/20 text-purple-900 dark:text-purple-100 italic border border-purple-300/50'
                                                            : isCurrentUser
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
                        {whisperWith && (
                            <div className="mb-2 flex items-center gap-2 rounded bg-purple-500/10 px-3 py-1.5">
                                <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                                    Whispering to{' '}
                                    {members.find((m) => m.id === whisperWith)?.name ||
                                        'User'}
                                </span>
                                <button
                                    onClick={() => setWhisperWith(null)}
                                    className="ml-auto"
                                >
                                    <X className="size-3 text-purple-900 dark:text-purple-100 hover:text-purple-700" />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    whisperWith
                                        ? 'Type a private message...'
                                        : 'Type a message...'
                                }
                                autoComplete="off"
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

                {/* Right: Pi Connect Panel */}
                <div className="w-48 shrink-0 border-l border-border pl-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                            Raspberry Pi
                        </h3>

                        {rover ? (
                            <div className="space-y-3 rounded-lg border border-border bg-card p-3">
                                {/* Status */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Status
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`size-2 rounded-full ${
                                                rover.is_online
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-500'
                                            }`}
                                        />
                                        <span className="text-xs font-medium">
                                            {rover.is_online ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>

                                {/* IP Address */}
                                {rover.ip_address && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            IP Address
                                        </p>
                                        <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                            {rover.ip_address}
                                        </p>
                                    </div>
                                )}

                                {/* Battery */}
                                {latestBattery && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Battery
                                        </p>
                                        {(() => {
                                            const batteryData =
                                                latestBattery.data as Record<string, unknown>;
                                            const percentage =
                                                batteryData.percentage || 0;
                                            return (
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs font-medium">
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Temperature */}
                                {latestTemp && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Temperature
                                        </p>
                                        {(() => {
                                            const tempData =
                                                latestTemp.data as Record<string, unknown>;
                                            const cpuTemp = tempData.cpu_temp || 0;
                                            return (
                                                <p className="text-xs font-medium">
                                                    {cpuTemp}°C
                                                </p>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Last Seen */}
                                {rover.last_seen_at && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            Last Seen
                                        </p>
                                        <p className="text-xs">
                                            {formatTime(rover.last_seen_at)}
                                        </p>
                                    </div>
                                )}

                                {/* Control Link */}
                                <a
                                    href="/control"
                                    className="block text-center text-xs font-medium bg-primary text-primary-foreground rounded px-2 py-1.5 hover:opacity-90 transition-opacity"
                                >
                                    Go to Control
                                </a>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border bg-card/50 p-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    No Raspberry Pi connected
                                </p>
                                <a
                                    href="/rover/setup"
                                    className="text-xs font-medium text-primary hover:underline"
                                >
                                    Set up a rover
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
