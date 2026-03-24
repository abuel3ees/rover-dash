import { useEffect } from 'react';
import echo from '@/lib/echo';

export type ChatMessagePayload = {
    id: string;
    user: {
        id: number;
        name: string;
        avatar?: string;
    };
    body: string;
    created_at: string;
};

export type PresenceUser = {
    id: number;
    name: string;
};

export function useChatChannel(
    onMessage: (data: ChatMessagePayload) => void,
    onMembersUpdate?: (members: PresenceUser[]) => void,
) {
    useEffect(() => {
        if (!echo) return;

        const channel = echo.join('chat');

        // Listen for messages
        channel.listen('.ChatMessageSent', onMessage);

        // Listen for member presence updates
        if (onMembersUpdate) {
            channel
                .here((members: PresenceUser[]) => {
                    onMembersUpdate(members);
                })
                .joining(() => {
                    channel.members().then((members: PresenceUser[]) => {
                        onMembersUpdate(members);
                    });
                })
                .leaving(() => {
                    channel.members().then((members: PresenceUser[]) => {
                        onMembersUpdate(members);
                    });
                });
        }

        return () => {
            if (echo) {
                echo.leave('chat');
            }
        };
    }, [onMessage, onMembersUpdate]);
}
