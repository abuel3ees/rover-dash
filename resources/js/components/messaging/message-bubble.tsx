import { Trash2, Edit2, Pin } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Message, MessageUser } from '@/types/messaging';

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

export function MessageBubble({
    message,
    isOwn,
    showAvatar,
    currentUserId,
    onEdit,
    onDelete,
    onPin,
    onReply,
    onReactionClick,
}: {
    message: Message;
    isOwn: boolean;
    showAvatar: boolean;
    currentUserId: number;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onPin?: (id: number) => void;
    onReply?: (msg: Message) => void;
    onReactionClick?: (emoji: string) => void;
}) {
    const isDeleted = message.deleted_at !== null;

    return (
        <div
            className={`flex gap-3 group ${
                showAvatar ? 'mt-4' : 'mt-0.5'
            } ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            {showAvatar ? (
                <Avatar className="mt-1 size-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {getInitials(message.user.name)}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="size-8 shrink-0" />
            )}

            <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {showAvatar && (
                    <div
                        className={`mb-1 flex items-center gap-2 ${
                            isOwn ? 'flex-row-reverse' : ''
                        }`}
                    >
                        <span className="text-xs font-medium">
                            {isOwn ? 'You' : message.user.name}
                        </span>
                        {message.edited_at && (
                            <span className="text-xs text-muted-foreground italic">
                                (edited)
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {formatTime(message.created_at)}
                        </span>
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={`relative inline-block rounded-2xl px-4 py-2 text-sm ${
                        isDeleted
                            ? 'bg-muted text-muted-foreground italic'
                            : isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                    }`}
                >
                    {isDeleted ? 'This message was deleted' : message.body}

                    {/* Hover action bar */}
                    {!isDeleted && (
                        <div
                            className={`absolute top-full mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                isOwn ? 'right-0' : 'left-0'
                            }`}
                        >
                            {onReactionClick && (
                                <button
                                    onClick={() => onReactionClick('👍')}
                                    className="text-lg hover:scale-125 transition-transform"
                                    title="React"
                                >
                                    👍
                                </button>
                            )}
                            {isOwn && (
                                <>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(message.id)}
                                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                            title="Edit"
                                        >
                                            <Edit2 className="size-3" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(message.id)}
                                            className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                                            title="Delete"
                                        >
                                            <Trash2 className="size-3" />
                                        </button>
                                    )}
                                </>
                            )}
                            {onPin && (
                                <button
                                    onClick={() => onPin(message.id)}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                                    title={message.is_pinned ? 'Unpin' : 'Pin'}
                                >
                                    <Pin
                                        className={`size-3 ${
                                            message.is_pinned
                                                ? 'fill-primary text-primary'
                                                : ''
                                        }`}
                                    />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {message.reactions.map((reaction) => (
                            <button
                                key={reaction.emoji}
                                onClick={() =>
                                    onReactionClick?.(reaction.emoji)
                                }
                                className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-colors ${
                                    reaction.reacted
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-muted hover:bg-muted/80'
                                }`}
                            >
                                <span>{reaction.emoji}</span>
                                <span className="text-xs">
                                    {reaction.count}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
