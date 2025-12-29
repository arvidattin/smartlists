import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Comment {
    id: string;
    task_id: string;
    user_id: string;
    message: string;
    type: 'comment' | 'log';
    created_at: string;
    user?: {
        username: string;
        avatar_url: string | null;
    };
}

export function useComments(taskId: string, listId: string) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!taskId) return;
        fetchComments();

        // Real-time subscription
        const subscription = supabase
            .channel(`comments_${taskId}`, { config: { private: true } })
            .on('broadcast', { event: '*' }, fetchComments)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [taskId]);

    async function fetchComments() {
        try {
            const { data, error } = await supabase
                .from('updates')
                .select(`
                    *,
                    user:profiles (
                        username,
                        avatar_url
                    )
                `)
                .eq('task_id', taskId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching comments:', error);
            } else {
                setComments(data as any || []);
            }
        } catch (e) {
            console.error('Exception fetching comments:', e);
        } finally {
            setLoading(false);
        }
    }

    async function addComment(message: string) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
            .from('updates')
            .insert({
                task_id: taskId,
                user_id: session.user.id,
                message,
                type: 'comment'
            });

        if (error) {
            console.error('Error adding comment:', error);
        } else {
            fetchComments();
            // Broadcast to comments modal
            supabase.channel(`comments_${taskId}`).send({
                type: 'broadcast',
                event: 'comments_update',
            });
            // Broadcast to list view
            supabase.channel(`list_realtime_${listId}`).send({
                type: 'broadcast',
                event: 'list_update',
            });
        }
    }

    return { comments, loading, addComment };
}
