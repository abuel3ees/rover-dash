import { useEffect, useState } from 'react';
import echo from '@/lib/echo';
import type { LobbyPresenceUser } from '@/types/messaging';

export function useLobbyPresence(callbacks?: {
    onOnlineUsersUpdate?: (users: LobbyPresenceUser[]) => void;
}) {
    const [onlineUsers, setOnlineUsers] = useState<LobbyPresenceUser[]>([]);

    useEffect(() => {
        if (!echo) return;

        const channel = echo.join('messaging.lobby');

        const updateUsers = (members: LobbyPresenceUser[]) => {
            setOnlineUsers(members);
            callbacks?.onOnlineUsersUpdate?.(members);
        };

        channel
            .here(updateUsers)
            .joining((member: LobbyPresenceUser) => {
                channel.members().then(updateUsers);
            })
            .leaving(() => {
                channel.members().then(updateUsers);
            });

        return () => {
            if (echo) {
                echo.leave('messaging.lobby');
            }
        };
    }, [callbacks]);

    return { onlineUsers };
}
