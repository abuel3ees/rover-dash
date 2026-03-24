import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from './use-debounce';
import type { Message } from '@/types/messaging';

export function useConversationSearch(conversationId: number | null) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Message[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (!conversationId || !debouncedQuery || debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `/messaging/conversations/${conversationId}/search?q=${encodeURIComponent(debouncedQuery)}`,
                );
                const data = await response.json();
                setResults(data.results || []);
            } catch (error) {
                console.error('Error searching messages:', error);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        performSearch();
    }, [conversationId, debouncedQuery]);

    return { query, setQuery, results, isSearching, clearSearch };
}
