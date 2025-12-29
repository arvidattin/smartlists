import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type List = Database['public']['Tables']['lists']['Row'];

export function useLists() {
    const [lists, setLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<any>(null);

    // Helpers
    const makeTempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const waitForSubscribed = (channel: any, timeout = 3000) =>
        new Promise<void>((resolve) => {
            if (!channel) return resolve();
            let resolved = false;
            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            }, timeout);
            // subscribe returns the channel so we attach a listener
            channel.subscribe((status: string) => {
                if (status === 'SUBSCRIBED' && !resolved) {
                    clearTimeout(timer);
                    resolved = true;
                    resolve();
                }
            });
        });

    useEffect(() => {
        fetchLists();

        const channel = supabase
            .channel('lists_channel', {
                config: {
                    broadcast: { self: true, ack: true },
                    private: true,
                },
            })
            .on('broadcast', { event: '*' }, (evt: any) => {
                // Expect payload: { action: 'created'|'updated'|'deleted', item, tempId? }
                try {
                    const { action, item, tempId } = evt.payload || {};
                    if (!action || !item) {
                        fetchLists();
                        return;
                    }

                    if (action === 'created') {
                        setLists(prev => {
                            // If tempId provided, replace that item atomically
                            if (tempId) {
                                const hasTemp = prev.some(l => l.id === tempId);
                                if (hasTemp) {
                                    return prev.map(l => (l.id === tempId ? item : l));
                                }
                                // If no temp, ensure we don't duplicate by server id
                                if (prev.some(l => l.id === item.id)) return prev;
                                return [item, ...prev];
                            }
                            // No tempId: dedupe by id
                            if (prev.some(l => l.id === item.id)) return prev;
                            return [item, ...prev];
                        });
                    } else if (action === 'updated') {
                        setLists(prev => prev.map(l => (l.id === item.id ? { ...l, ...item } : l)));
                    } else if (action === 'deleted') {
                        setLists(prev => prev.filter(l => l.id !== item.id && l.id !== tempId));
                    } else {
                        // unknown action fallback
                        fetchLists();
                    }
                } catch (e) {
                    console.error('Error handling broadcast payload, refetching:', e);
                    fetchLists();
                }
            })
            .subscribe((status: string) => {
                console.log('Lists subscription status:', status);
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchLists() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('lists')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching lists:', error);
            } else {
                setLists(data || []);
            }
        } catch (e) {
            console.error('Exception fetching lists:', e);
        } finally {
            setLoading(false);
        }
    }

    async function createList(
        title: string,
        type: 'standard' | 'advanced',
        icon_name: string = 'list',
        icon_color: string = '#6366f1'
    ) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        // Ensure profile exists (same as your logic)
        const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single();

        if (profileError && profileError.code === 'PGRST116') {
            await supabase.from('profiles').insert({
                id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                full_name: 'User',
                avatar_url: null,
                updated_at: new Date().toISOString()
            });
        }

        // Optimistic item with temp id
        const tempId = makeTempId();
        const optimistic: List = {
            id: tempId,
            owner_id: session.user.id,
            title,
            type,
            icon_name,
            icon_color,
            created_at: new Date().toISOString()
        } as unknown as List;

        setLists(prev => [optimistic, ...prev]);

        // Attempt DB insert
        const { data, error } = await supabase
            .from('lists')
            .insert({
                owner_id: session.user.id,
                title,
                type,
                icon_name,
                icon_color
            })
            .select()
            .single();

        if (error) {
            // Rollback optimistic item
            setLists(prev => prev.filter(l => l.id !== tempId));
            console.error('Error creating list:', error);
            return null;
        }

        // Replace optimistic item with canonical server row
        setLists(prev => {
            const replaced = prev.map(l => (l.id === tempId ? data : l));
            // If temp was not present for some reason, ensure server row is present and deduped
            if (!replaced.some(l => l.id === data.id)) {
                return [data, ...prev.filter(l => l.id !== tempId)];
            }
            return replaced;
        });

        // Broadcast payload with tempId so originator can reconcile (and others get item)
        await waitForSubscribed(channelRef.current);
        channelRef.current?.send({
            type: 'broadcast',
            event: 'list_update',
            payload: { action: 'created', item: data, tempId }
        });

        return data;
    }

    async function updateList(id: string, updates: Partial<List>) {
        // Keep a snapshot for rollback
        const prevSnapshot = lists;
        // Optimistic update locally
        setLists(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));

        // Exclude features if missing in DB, same as your safeUpdates
        const { features, ...safeUpdates } = updates as any;

        const { data, error } = await supabase
            .from('lists')
            .update(safeUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            // Rollback
            setLists(prevSnapshot);
            console.error('Error updating list:', error);
            return false;
        }

        // Use returned data to ensure canonical state
        setLists(prev => prev.map(l => (l.id === id ? data : l)));

        await waitForSubscribed(channelRef.current);
        channelRef.current?.send({
            type: 'broadcast',
            event: 'list_update',
            payload: { action: 'updated', item: data }
        });

        return true;
    }

    async function deleteList(id: string) {
        // Keep snapshot for rollback
        const prevSnapshot = lists;
        // Optimistic removal
        setLists(prev => prev.filter(l => l.id !== id));

        const { error } = await supabase
            .from('lists')
            .delete()
            .eq('id', id);

        if (error) {
            // Rollback
            setLists(prevSnapshot);
            console.error('Error deleting list:', error);
            return false;
        }

        await waitForSubscribed(channelRef.current);
        channelRef.current?.send({
            type: 'broadcast',
            event: 'list_update',
            payload: { action: 'deleted', item: { id } }
        });

        return true;
    }

    return { lists, loading, createList, updateList, deleteList, refreshLists: fetchLists, refetch: fetchLists };
}