import { Pin, X } from 'lucide-react';

export function PinnedMessagesBanner({
    count,
    onShowPinned,
    onDismiss,
}: {
    count: number;
    onShowPinned: () => void;
    onDismiss: () => void;
}) {
    if (count === 0) return null;

    return (
        <div className="flex items-center justify-between gap-2 bg-primary/10 border-b border-border px-4 py-2">
            <button
                onClick={onShowPinned}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
                <Pin className="size-4 fill-primary" />
                {count} pinned {count === 1 ? 'message' : 'messages'}
            </button>
            <button
                onClick={onDismiss}
                className="text-muted-foreground hover:text-foreground"
                title="Dismiss"
            >
                <X className="size-4" />
            </button>
        </div>
    );
}
