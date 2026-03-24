import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Square } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type Direction = 'forward' | 'backward' | 'left' | 'right';

export function DirectionalPad({
    onMove,
    onStop,
    disabled = false,
}: {
    onMove: (direction: Direction) => void;
    onStop: () => void;
    disabled?: boolean;
}) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (disabled) return;
            if (e.repeat) return;

            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    e.preventDefault();
                    onMove('forward');
                    break;
                case 's':
                case 'ArrowDown':
                    e.preventDefault();
                    onMove('backward');
                    break;
                case 'a':
                case 'ArrowLeft':
                    e.preventDefault();
                    onMove('left');
                    break;
                case 'd':
                case 'ArrowRight':
                    e.preventDefault();
                    onMove('right');
                    break;
                case ' ':
                    e.preventDefault();
                    onStop();
                    break;
            }
        },
        [disabled, onMove, onStop],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="grid grid-cols-3 gap-2">
                <div />
                <Button
                    variant="outline"
                    size="lg"
                    className="size-14"
                    onClick={() => onMove('forward')}
                    disabled={disabled}
                >
                    <ArrowUp className="size-6" />
                </Button>
                <div />

                <Button
                    variant="outline"
                    size="lg"
                    className="size-14"
                    onClick={() => onMove('left')}
                    disabled={disabled}
                >
                    <ArrowLeft className="size-6" />
                </Button>
                <Button
                    variant="destructive"
                    size="lg"
                    className="size-14"
                    onClick={onStop}
                    disabled={disabled}
                >
                    <Square className="size-5" />
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="size-14"
                    onClick={() => onMove('right')}
                    disabled={disabled}
                >
                    <ArrowRight className="size-6" />
                </Button>

                <div />
                <Button
                    variant="outline"
                    size="lg"
                    className="size-14"
                    onClick={() => onMove('backward')}
                    disabled={disabled}
                >
                    <ArrowDown className="size-6" />
                </Button>
                <div />
            </div>
            <p className="text-xs text-muted-foreground">
                WASD or Arrow keys to move, Space to stop
            </p>
        </div>
    );
}
