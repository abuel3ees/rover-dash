import { useEffect } from 'react';
import echo from '@/lib/echo';
import type { CommandStatus, CommandType } from '@/types';

export type TelemetryPayload = {
    id: number;
    type: string;
    data: Record<string, unknown>;
    recorded_at: string;
};

export type StatusPayload = {
    id: number;
    status: string;
    is_online: boolean;
    last_seen_at: string | null;
};

export type CommandPayload = {
    id: number;
    type: CommandType;
    payload?: Record<string, unknown>;
    status: CommandStatus;
    executed_at?: string;
    response?: string;
    created_at?: string;
};

export function useRoverChannel(
    roverId: number | undefined,
    callbacks: {
        onTelemetry?: (data: TelemetryPayload) => void;
        onStatusChange?: (data: StatusPayload) => void;
        onCommandSent?: (data: CommandPayload) => void;
        onCommandCompleted?: (data: CommandPayload) => void;
    },
) {
    useEffect(() => {
        if (!roverId) return;

        const channel = echo.channel(`rover.${roverId}`);

        if (callbacks.onTelemetry) {
            channel.listen('.TelemetryReceived', callbacks.onTelemetry);
        }
        if (callbacks.onStatusChange) {
            channel.listen('.RoverStatusChanged', callbacks.onStatusChange);
        }
        if (callbacks.onCommandSent) {
            channel.listen('.CommandSent', callbacks.onCommandSent);
        }
        if (callbacks.onCommandCompleted) {
            channel.listen('.CommandCompleted', callbacks.onCommandCompleted);
        }

        return () => {
            echo.leave(`rover.${roverId}`);
        };
    }, [roverId]); // eslint-disable-line react-hooks/exhaustive-deps
}
