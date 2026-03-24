import { useState, useCallback } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
            <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle className="text-base font-semibold">
                        New Conversation
                    </DialogTitle>
                </DialogHeader>

                <div className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-border/60 bg-muted/30 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                        />
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto px-2 pb-3">
                    {filtered.map((user) => (
                        <button
                            key={user.id}
                            onClick={() => handleSelectUser(user.id)}
                            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/60 transition-all group"
                        >
                            <div className="relative">
                                <Avatar className="size-9 ring-1 ring-border/50 shadow-sm">
                                    <AvatarFallback className="bg-linear-to-br from-primary/15 to-primary/5 text-primary text-xs font-semibold">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                {user.is_online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium truncate">
                                    {user.name}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1.5 text-[11px] text-primary font-medium">
                                    <MessageCircle className="size-3.5" />
                                    Message
                                </div>
                            </div>
                        </button>
                    ))}

                    {filtered.length === 0 && searchQuery !== '' && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Search className="size-8 text-muted-foreground/20 mb-2" />
                            <p className="text-xs text-muted-foreground">
                                No one found for "{searchQuery}"
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
