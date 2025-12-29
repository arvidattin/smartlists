import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'] & {
    subtasks?: { completed: boolean }[];
    updates?: (Database['public']['Tables']['updates']['Row'] & {
        user?: Database['public']['Tables']['profiles']['Row'] | null;
    })[];
};

export function useTasks(listId: string) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<any>(null);

    // Helper: wait until channel is SUBSCRIBED (with timeout)
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
            channel.subscribe((status: string) => {
                if (status === 'SUBSCRIBED' && !resolved) {
                    clearTimeout(timer);
                    resolved = true;
                    resolve();
                }
            });
        });

    useEffect(() => {
        if (!listId) return;
        fetchTasks();

        const channel = supabase
            .channel(`list_realtime_${listId}`, {
                config: {
                    broadcast: { self: true, ack: true },
                    private: true,
                },
            })
            .on('broadcast', { event: 'list_update' }, (payload: any) => {
                // Prefer applying the payload instead of refetching everything
                // Payload shape: { action: 'created'|'updated'|'deleted', item }
                try {
                    const { action, item } = payload?.payload || {};
                    if (!action || !item) {
                        // Fallback: if no payload, do a full refetch
                        fetchTasks();
                        return;
                    }
                    if (action === 'created') {
                        setTasks(prev => {
                            // Dedupe by id if already present
                            if (prev.some(t => t.id === item.id)) return prev;
                            return [item, ...prev];
                        });
                    } else if (action === 'updated') {
                        setTasks(prev => prev.map(t => t.id === item.id ? { ...t, ...item } : t));
                    } else if (action === 'deleted') {
                        setTasks(prev => prev.filter(t => t.id !== item.id));
                    } else {
                        fetchTasks();
                    }
                } catch (e) {
                    console.error('Error handling broadcast payload, refetching:', e);
                    fetchTasks();
                }
            })
            .subscribe((status: string) => {
                // Optional: log or react to status changes
                console.log('List subscription status:', status);
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listId]);

    async function fetchTasks() {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          subtasks (*),
          updates (
            *,
            user:profiles (*)
          )
        `)
                .eq('list_id', listId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error);
            } else {
                const tasksWithSortedUpdates = (data || []).map((t: any) => ({
                    ...t,
                    updates: t.updates?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                }));
                setTasks(tasksWithSortedUpdates);
            }
        } catch (e) {
            console.error('Exception fetching tasks:', e);
        } finally {
            setLoading(false);
        }
    }

    async function createTask(
        title: string,
        priority: 'low' | 'normal' | 'high' = 'normal',
        dueDate?: string | null,
        assigneeId?: string | null,
        subtasks: string[] = [],
        tags: { label: string; color: string }[] = []
    ) {
        const { data: { session } } = await supabase.auth.getSession();

        // Insert Task (use returned row)
        const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .insert({
                list_id: listId,
                title,
                priority,
                due_date: dueDate,
                assignee_id: assigneeId || session?.user?.id,
                status: false,
            })
            .select()
            .single();

        if (taskError) {
            console.error('Error creating task:', taskError);
            return null;
        }

        // Insert Subtasks (fire-and-forget; you may want to await and merge)
        if (subtasks.length > 0 && taskData) {
            const subtaskRows = subtasks.map(st => ({
                task_id: taskData.id,
                title: st,
                completed: false
            }));

            const { error: subtaskError } = await supabase
                .from('subtasks')
                .insert(subtaskRows);

            if (subtaskError) {
                console.error('Error creating subtasks:', subtaskError);
            }
        }

        // Use the canonical DB row to update local state
        const newTask = { ...taskData, updates: [] };
        setTasks(prev => {
            if (prev.some(t => t.id === newTask.id)) return prev;
            return [newTask, ...prev];
        });

        // Ensure channel is ready; wait up to 3s
        await waitForSubscribed(channelRef.current);

        // Send a payload so receivers (including self) can update without full refetch
        channelRef.current?.send({
            type: 'broadcast',
            event: 'list_update',
            payload: { action: 'created', item: newTask }
        });

        return taskData;
    }

    async function toggleTask(taskId: string, currentStatus: boolean) {
        const { data: updatedRows, error } = await supabase
            .from('tasks')
            .update({ status: !currentStatus })
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error toggling task:', error);
            return;
        }

        // Update local state using returned row
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedRows } : t));

        await waitForSubscribed(channelRef.current);

        channelRef.current?.send({
            type: 'broadcast',
            event: 'list_update',
            payload: { action: 'updated', item: updatedRows }
        });
    }

    return { tasks, loading, createTask, toggleTask };
}