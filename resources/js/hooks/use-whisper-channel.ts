import { useEffect } from 'react';
import echo from '@/lib/echo';

export type WhisperPayload = {
    id: string;
    sender: {
        id: number;
        name: string;
    };
    recipient_id: number;
    body: string;
    created_at: string;
};

export function useWhisperChannel(
    userId: number,
    onWhisper: (data: WhisperPayload) => void,
) {
    useEffect(() => {
        if (!echo) return;

        const channel = echo.private('chat.whisper.' + userId);
        channel.listen('.WhisperSent', onWhisper);

        return () => {
            if (echo) {
                echo.leavePrivateChannel('chat.whisper.' + userId);
            }
        };
    }, [userId, onWhisper]);
}
