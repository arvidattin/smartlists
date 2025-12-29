import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

interface Invitation {
    id: string;
    list_id: string;
    role: string;
    invited_at: string;
    list: {
        title: string;
        owner: {
            username: string;
        };
    };
}

export default function Invitations() {
    const [invites, setInvites] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInvites = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // We need to fetch list_members where user_id is us AND status is 'pending'
            // And join with lists and profiles (for owner name)
            const { data, error } = await supabase
                .from('list_members')
                .select(`
                    id,
                    list_id,
                    role,
                    invited_at,
                    list:lists (
                        title,
                        owner:profiles!lists_owner_id_fkey (
                            username
                        )
                    )
                `)
                .eq('user_id', session.user.id)
                .eq('status', 'pending')
                .order('invited_at', { ascending: false });

            if (error) {
                console.error('Error fetching invites:', error);
            } else {
                setInvites(data as any || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRespond = async (id: string, accept: boolean) => {
        try {
            if (accept) {
                await supabase
                    .from('list_members')
                    .update({ status: 'accepted' })
                    .eq('id', id);
            } else {
                await supabase
                    .from('list_members')
                    .delete()
                    .eq('id', id);
            }
            // Optimistic update
            setInvites(prev => prev.filter(i => i.id !== id));
        } catch (e) {
            console.error('Error responding to invite:', e);
        }
    };

    useEffect(() => {
        fetchInvites();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInvites();
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <View className="px-5 py-4">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Invitations</Text>
                <Text className="text-sm text-gray-500 mt-1">Manage your list collaborations</Text>
            </View>

            <FlatList
                data={invites}
                keyExtractor={item => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    !loading ? (
                        <View className="flex-1 items-center justify-center py-20 opacity-50">
                            <MaterialIcons name="mail-outline" size={64} color="#9ca3af" />
                            <Text className="text-base font-medium text-gray-500 mt-4">No pending invitations</Text>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => {
                    if (!item.list) return (
                        <View className="mx-5 mb-4 p-4 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800 opacity-50">
                            <Text className="text-gray-500 italic">List unavailable (No access or deleted)</Text>
                        </View>
                    );

                    return (
                        <View className="mx-5 mb-4 p-4 rounded-2xl bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
                            <View className="flex-row items-start justify-between">
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">
                                        {item.list.title}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        Invited by <Text className="font-semibold text-primary">{item.list.owner?.username || 'Unknown'}</Text>
                                    </Text>
                                </View>
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                                    <MaterialIcons name="group-add" size={20} color="#3b82f6" />
                                </View>
                            </View>

                            <View className="flex-row gap-3 mt-4">
                                <TouchableOpacity
                                    onPress={() => handleRespond(item.id, false)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 items-center"
                                >
                                    <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">Decline</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleRespond(item.id, true)}
                                    className="flex-1 py-2.5 rounded-xl bg-primary items-center"
                                >
                                    <Text className="text-sm font-bold text-white">Accept</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
}
