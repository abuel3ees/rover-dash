import type { MessageUser } from '@/types/messaging';

export function TypingIndicator({ users }: { users: MessageUser[] }) {
    if (users.length === 0) return null;

    const names = users.map((u) => u.name.split(' ')[0]).join(', ');
    const isPlural = users.length > 1;

    return (
        <div className="flex items-center gap-2 px-5 pt-2 pb-0">
            <div className="flex items-center gap-0.75">
                <span className="inline-block size-1.25 rounded-full bg-primary/40 animate-bounce" />
                <span
                    className="inline-block size-1.25 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                />
                <span
                    className="inline-block size-1.25 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                />
            </div>
            <span className="text-[11px] text-muted-foreground">
                {names} {isPlural ? 'are' : 'is'} typing
            </span>
        </div>
    );
}
