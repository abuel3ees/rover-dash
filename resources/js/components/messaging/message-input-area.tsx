import { SendHorizontal, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypingIndicator } from './typing-indicator';
import type { Message, MessageUser } from '@/types/messaging';

export function MessageInputArea({
    body,
    onBodyChange,
    onSend,
    isLoading,
    typingUsers,
    replyingTo,
    onCancelReply,
}: {
    body: string;
    onBodyChange: (body: string) => void;
    onSend: () => void;
    isLoading: boolean;
    typingUsers: MessageUser[];
    replyingTo: Message | null;
    onCancelReply: () => void;
}) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
            <TypingIndicator users={typingUsers} />

            {replyingTo && (
                <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-0.5 h-8 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-primary">
                                Replying to {replyingTo.user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {replyingTo.body}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSend();
                }}
                className="flex items-end gap-2 p-4"
            >
                <div className="flex-1 relative">
                    <textarea
                        value={body}
                        onChange={(e) => {
                            onBodyChange(e.target.value);
                            // Auto-resize
                            e.target.style.height = 'auto';
                            e.target.style.height =
                                Math.min(e.target.scrollHeight, 120) + 'px';
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        disabled={isLoading}
                        rows={1}
                        className="w-full resize-none rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 disabled:opacity-50 transition-all"
                    />
                </div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !body.trim()}
                    className="size-10 rounded-xl bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all disabled:opacity-30 shrink-0"
                >
                    <SendHorizontal className="size-4" />
                </Button>
            </form>
        </div>
    );
}
