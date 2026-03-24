import { useState, useCallback } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { UserDirectory } from '@/types/messaging';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function UserDirectoryModal({
    isOpen,
    onClose,
    users,
    onSelectUser,
}: {
    isOpen: boolean;
    onClose: () => void;
    users: UserDirectory[];
    onSelectUser: (userId: number) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = users.filter(
        (u) =>
            searchQuery === '' ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const handleSelectUser = useCallback(
        (userId: number) => {
            onSelectUser(userId);
            onClose();
            setSearchQuery('');
        },
        [onSelectUser, onClose],
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />

                    <div className="max-h-96 overflow-y-auto space-y-1">
                        {filtered.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between gap-2 rounded-md p-2 hover:bg-muted"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Avatar className="size-8">
                                        <AvatarFallback className="bg-primary/10 text-xs">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {user.is_online && (
                                        <div className="size-2 rounded-full bg-green-500" />
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-8"
                                        onClick={() =>
                                            handleSelectUser(user.id)
                                        }
                                        title="Message"
                                    >
                                        <MessageCircle className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && searchQuery !== '' && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                            No users found
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
