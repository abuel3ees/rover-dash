export type ConversationType = 'broadcast' | 'dm' | 'group';

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👏'] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export type MessageReaction = {
    emoji: ReactionEmoji;
    count: number;
    reacted: boolean;
};

export type MessageUser = {
    id: number;
    name: string;
    avatar?: string | null;
};

export type Message = {
    id: number;
    conversation_id: number;
    user: MessageUser;
    reply_to_id: number | null;
    reply_to?: Pick<Message, 'id' | 'user' | 'body'> | null;
    body: string;
    is_pinned: boolean;
    edited_at: string | null;
    deleted_at: string | null;
    created_at: string;
    reactions: MessageReaction[];
};

export type ConversationParticipant = {
    id: number;
    name: string;
    avatar?: string | null;
    last_active_at: string | null;
    is_online: boolean;
    last_read_message_id: number | null;
};

export type Conversation = {
    id: number;
    type: ConversationType;
    name: string | null;
    participants: ConversationParticipant[];
    latest_message: Message | null;
    unread_count: number;
    created_at: string;
};

export type MessagingPageProps = {
    conversations: Conversation[];
    allUsers: UserDirectory[];
    broadcastConversationId: number;
};

export type UserDirectory = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    last_active_at: string | null;
    is_online: boolean;
};

// Broadcast payloads
export type MessageSentPayload = Message;

export type MessageUpdatedPayload = {
    id: number;
    body: string;
    edited_at: string;
};

export type MessageDeletedPayload = {
    id: number;
    deleted_at: string;
};

export type MessageReactionPayload = {
    message_id: number;
    reactions: MessageReaction[];
};

export type MessagePinnedPayload = {
    message_id: number;
    is_pinned: boolean;
};

export type ConversationReadPayload = {
    conversation_id: number;
    user_id: number;
    last_read_message_id: number | null;
};

export type TypingPayload = {
    user: MessageUser;
    conversation_id: number;
};

export type LobbyPresenceUser = {
    id: number;
    name: string;
    avatar?: string | null;
    last_active_at: string | null;
};
