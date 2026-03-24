export function ConnectionIndicator({ isOnline }: { isOnline: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`size-2.5 rounded-full ${
                    isOnline
                        ? 'animate-pulse bg-green-500'
                        : 'bg-neutral-400'
                }`}
            />
            <span className="text-sm">
                {isOnline ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );
}
