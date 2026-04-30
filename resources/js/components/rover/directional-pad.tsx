import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Square,
} from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

type Direction = 'forward' | 'backward' | 'left' | 'right';
type RotationDirection = 'clockwise' | 'counterclockwise';
type DriveCommand =
    | { type: 'move'; direction: Direction }
    | { type: 'rotate'; direction: RotationDirection };

const HOLD_REPEAT_MS = 250;

const keyCommands: Record<string, DriveCommand> = {
    w: { type: 'move', direction: 'forward' },
    ArrowUp: { type: 'move', direction: 'forward' },
    s: { type: 'move', direction: 'backward' },
    ArrowDown: { type: 'move', direction: 'backward' },
    a: { type: 'move', direction: 'left' },
    ArrowLeft: { type: 'move', direction: 'left' },
    d: { type: 'move', direction: 'right' },
    ArrowRight: { type: 'move', direction: 'right' },
    q: { type: 'rotate', direction: 'counterclockwise' },
    e: { type: 'rotate', direction: 'clockwise' },
};

function normalizeKey(key: string): string {
    return key.length === 1 ? key.toLowerCase() : key;
}

function isEditableTarget(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT')
    );
}

export function DirectionalPad({
    onMove,
    onRotate,
    onStop,
    disabled = false,
}: {
    onMove: (direction: Direction) => void;
    onRotate: (direction: RotationDirection) => void;
    onStop: () => void;
    disabled?: boolean;
}) {
    const onMoveRef = useRef(onMove);
    const onRotateRef = useRef(onRotate);
    const onStopRef = useRef(onStop);
    const heldKeysRef = useRef<Map<string, DriveCommand>>(new Map());
    const activeKeyRef = useRef<string | null>(null);
    const repeatTimerRef = useRef<number | null>(null);

    useEffect(() => {
        onMoveRef.current = onMove;
        onRotateRef.current = onRotate;
        onStopRef.current = onStop;
    }, [onMove, onRotate, onStop]);

    const sendDriveCommand = useCallback((command: DriveCommand) => {
        if (command.type === 'move') {
            onMoveRef.current(command.direction);
            return;
        }

        onRotateRef.current(command.direction);
    }, []);

    const clearRepeatTimer = useCallback(() => {
        if (repeatTimerRef.current !== null) {
            window.clearInterval(repeatTimerRef.current);
            repeatTimerRef.current = null;
        }
    }, []);

    const stopHeldCommand = useCallback(
        (sendStop: boolean) => {
            heldKeysRef.current.clear();
            activeKeyRef.current = null;
            clearRepeatTimer();

            if (sendStop) {
                onStopRef.current();
            }
        },
        [clearRepeatTimer],
    );

    const startHeldCommand = useCallback(
        (key: string, command: DriveCommand) => {
            activeKeyRef.current = key;
            clearRepeatTimer();
            sendDriveCommand(command);
            repeatTimerRef.current = window.setInterval(() => {
                sendDriveCommand(command);
            }, HOLD_REPEAT_MS);
        },
        [clearRepeatTimer, sendDriveCommand],
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (isEditableTarget(e.target)) return;
            if (disabled) return;

            const key = normalizeKey(e.key);

            if (key === ' ') {
                e.preventDefault();
                stopHeldCommand(false);
                onStopRef.current();
                return;
            }

            const command = keyCommands[key];
            if (!command) return;

            e.preventDefault();

            if (activeKeyRef.current === key) return;

            heldKeysRef.current.delete(key);
            heldKeysRef.current.set(key, command);
            startHeldCommand(key, command);
        },
        [disabled, startHeldCommand, stopHeldCommand],
    );

    const handleKeyUp = useCallback(
        (e: KeyboardEvent) => {
            const key = normalizeKey(e.key);
            if (!keyCommands[key]) return;

            e.preventDefault();
            heldKeysRef.current.delete(key);

            if (activeKeyRef.current !== key) return;

            const nextHeld = Array.from(heldKeysRef.current.entries()).pop();
            if (nextHeld) {
                startHeldCommand(nextHeld[0], nextHeld[1]);
                return;
            }

            stopHeldCommand(!disabled);
        },
        [disabled, startHeldCommand, stopHeldCommand],
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const handleBlur = () => stopHeldCommand(!disabled);
        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopHeldCommand(!disabled);
            }
        };

        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange,
            );
        };
    }, [disabled, handleKeyDown, handleKeyUp, stopHeldCommand]);

    useEffect(() => {
        if (disabled) {
            stopHeldCommand(false);
        }
    }, [disabled, stopHeldCommand]);

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
        </div>
    );
}
