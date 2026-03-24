import { Pin, ChevronRight, X } from 'lucide-react';

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
        <div className="flex items-center justify-between gap-2 mx-4 mt-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
            <button
                onClick={onShowPinned}
                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
                <Pin className="size-3.5 fill-primary/30" />
                {count} pinned {count === 1 ? 'message' : 'messages'}
                <ChevronRight className="size-3" />
            </button>
            <button
                onClick={onDismiss}
                className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Dismiss"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}
