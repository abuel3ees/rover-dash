import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <div className="border-t border-border bg-card p-4">
            <TypingIndicator users={typingUsers} />

            {replyingTo && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded bg-muted/50 px-3 py-2">
                    <div className="text-xs">
                        <p className="font-medium">
                            Replying to{' '}
                            {replyingTo.user.name}
                        </p>
                        <p className="text-muted-foreground truncate">
                            {replyingTo.body}
                        </p>
                    </div>
                    <button
                        onClick={onCancelReply}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSend();
                }}
                className="flex gap-2"
            >
                <Input
                    value={body}
                    onChange={(e) => onBodyChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isLoading}
                    className="flex-1"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !body.trim()}
                >
                    <Send className="size-4" />
                </Button>
            </form>
        </div>
    );
}
