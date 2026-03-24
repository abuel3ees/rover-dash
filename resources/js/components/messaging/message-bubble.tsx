import { Trash2, Edit2, Pin, Reply, SmilePlus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { REACTION_EMOJIS } from '@/types/messaging';
import { useState } from 'react';
import type { Message } from '@/types/messaging';

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
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
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
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const isDeleted = message.deleted_at !== null;

    return (
        <div
            className={`flex gap-2.5 group relative ${
                showAvatar ? 'mt-5' : 'mt-0.5'
            } ${isOwn ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            {showAvatar ? (
                <Avatar className="mt-0.5 size-8 shrink-0 ring-1 ring-border/50 shadow-sm">
                    <AvatarFallback
                        className={`text-[10px] font-semibold ${
                            isOwn
                                ? 'bg-linear-to-br from-primary/25 to-primary/10 text-primary'
                                : 'bg-linear-to-br from-secondary to-muted text-foreground/70'
                        }`}
                    >
                        {getInitials(message.user.name)}
                    </AvatarFallback>
                </Avatar>
            ) : (
                <div className="size-8 shrink-0" />
            )}

            <div
                className={`max-w-[65%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
            >
                {/* Name + Time */}
                {showAvatar && (
                    <div
                        className={`mb-1 flex items-center gap-2 ${
                            isOwn ? 'flex-row-reverse' : ''
                        }`}
                    >
                        <span className="text-[11px] font-semibold text-foreground/80">
                            {isOwn ? 'You' : message.user.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                            {formatTime(message.created_at)}
                        </span>
                        {message.edited_at && (
                            <span className="text-[10px] text-muted-foreground/50 italic">
                                edited
                            </span>
                        )}
                    </div>
                )}

                {/* Bubble */}
                <div className="relative">
                    <div
                        className={`relative inline-block rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                            isDeleted
                                ? 'bg-muted/40 text-muted-foreground/60 italic border border-dashed border-border/50'
                                : isOwn
                                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                  : 'bg-accent/80 text-foreground shadow-sm shadow-black/3'
                        } ${
                            isOwn
                                ? showAvatar
                                    ? 'rounded-tr-md'
                                    : ''
                                : showAvatar
                                  ? 'rounded-tl-md'
                                  : ''
                        }`}
                    >
                        {/* Reply preview */}
                        {message.reply_to && !isDeleted && (
                            <div
                                className={`mb-1.5 pl-2.5 border-l-2 text-[11px] ${
                                    isOwn
                                        ? 'border-primary-foreground/30 text-primary-foreground/70'
                                        : 'border-primary/40 text-muted-foreground'
                                }`}
                            >
                                <p className="font-medium">
                                    {message.reply_to.user.name}
                                </p>
                                <p className="truncate max-w-48 opacity-80">
                                    {message.reply_to.body}
                                </p>
                            </div>
                        )}

                        {isDeleted
                            ? 'This message was deleted'
                            : message.body}

                        {/* Pinned indicator */}
                        {message.is_pinned && !isDeleted && (
                            <Pin
                                className={`inline-block ml-1.5 size-3 ${
                                    isOwn
                                        ? 'text-primary-foreground/50'
                                        : 'text-primary/50'
                                }`}
                            />
                        )}
                    </div>

                    {/* Hover toolbar */}
                    {!isDeleted && (
                        <div
                            className={`absolute -top-8 flex items-center gap-0.5 p-0.5 rounded-lg bg-card border border-border/80 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-150 z-10 ${
                                isOwn ? 'right-0' : 'left-0'
                            }`}
                        >
                            {onReactionClick && (
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setShowReactionPicker(
                                                !showReactionPicker,
                                            )
                                        }
                                        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                        title="React"
                                    >
                                        <SmilePlus className="size-3.5" />
                                    </button>
                                    {showReactionPicker && (
                                        <div
                                            className={`absolute top-full mt-1 flex gap-0.5 p-1 rounded-lg bg-card border border-border shadow-xl z-20 ${
                                                isOwn ? 'right-0' : 'left-0'
                                            }`}
                                        >
                                            {REACTION_EMOJIS.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => {
                                                        onReactionClick(emoji);
                                                        setShowReactionPicker(
                                                            false,
                                                        );
                                                    }}
                                                    className="p-1 rounded-md hover:bg-accent text-base hover:scale-125 transition-transform"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {onReply && (
                                <button
                                    onClick={() => onReply(message)}
                                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    title="Reply"
                                >
                                    <Reply className="size-3.5" />
                                </button>
                            )}
                            {onPin && (
                                <button
                                    onClick={() => onPin(message.id)}
                                    className={`p-1.5 rounded-md hover:bg-accent transition-colors ${
                                        message.is_pinned
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    title={
                                        message.is_pinned ? 'Unpin' : 'Pin'
                                    }
                                >
                                    <Pin className="size-3.5" />
                                </button>
                            )}
                            {isOwn && onDelete && (
                                <button
                                    onClick={() => onDelete(message.id)}
                                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="size-3.5" />
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
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-all duration-150 ${
                                    reaction.reacted
                                        ? 'bg-primary/15 text-primary ring-1 ring-primary/30 shadow-sm'
                                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                <span className="text-xs">
                                    {reaction.emoji}
                                </span>
                                <span className="font-medium tabular-nums">
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
