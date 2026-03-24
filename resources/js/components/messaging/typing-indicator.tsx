import type { MessageUser } from '@/types/messaging';

export function TypingIndicator({ users }: { users: MessageUser[] }) {
    if (users.length === 0) return null;

    const names = users.map((u) => u.name).join(', ');
    const isPlural = users.length > 1;

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2">
            <div className="flex gap-1">
                <span className="inline-block size-2 rounded-full bg-muted-foreground animate-bounce" />
                <span
                    className="inline-block size-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                />
                <span
                    className="inline-block size-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                />
            </div>
            <span>
                {names} {isPlural ? 'are' : 'is'} typing...
            </span>
        </div>
    );
}
