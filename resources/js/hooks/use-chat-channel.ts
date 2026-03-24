import { useEffect } from 'react';
import echo from '@/lib/echo';

export type ChatMessagePayload = {
    id: number;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    body: string;
    created_at: string;
};

export function useChatChannel(
    onMessage: (data: ChatMessagePayload) => void,
) {
    useEffect(() => {
        const channel = echo.channel('chat');
        channel.listen('.ChatMessageSent', onMessage);

        return () => {
            echo.leave('chat');
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
