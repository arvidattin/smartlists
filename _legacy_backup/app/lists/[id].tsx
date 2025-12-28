import { supabase } from '@/lib/supabase';
import { Item } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [newItemLabel, setNewItemLabel] = useState('');
    const [loading, setLoading] = useState(true);
    const [listName, setListName] = useState('');

    useEffect(() => {
        fetchListDetails();
        fetchItems();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('items_channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'items', filter: `list_id=eq.${id}` },
                (payload) => {
                    fetchItems();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [id]);

    const fetchListDetails = async () => {
        const { data } = await supabase.from('lists').select('name').eq('id', id).single();
        if (data) setListName(data.name);
    };

    const fetchItems = async () => {
        try {
            // We need to order by created_at or id to keep consistent order
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('list_id', id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async () => {
        if (!newItemLabel.trim()) return;

        try {
            const { error } = await supabase.from('items').insert({
                list_id: id,
                label: newItemLabel,
            });

            if (error) throw error;
            setNewItemLabel('');
            // fetchItems() handled by realtime ideally, but safe to call
        } catch (e) {
            console.error('Error adding item:', e);
            alert('Could not add item');
        }
    };

    const toggleItem = async (itemId: string, isDone: boolean) => {
        // Optimistic update
        setItems(current =>
            current.map(i => i.id === itemId ? { ...i, is_done: !isDone } : i)
        );

        try {
            const { error } = await supabase
                .from('items')
                .update({ is_done: !isDone })
                .eq('id', itemId);

            if (error) throw error;
        } catch (e) {
            console.error('Error toggling item:', e);
            // Revert if needed, but usually fine
        }
    };

    const deleteItem = async (itemId: string) => {
        // Optimistic
        setItems(current => current.filter(i => i.id !== itemId));

        try {
            const { error } = await supabase.from('items').delete().eq('id', itemId);
            if (error) throw error;
        } catch (e) {
            console.error(e);
        }
    }

    const renderItem = ({ item }: { item: Item }) => (
        <View className="flex-row items-center justify-between p-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
            <TouchableOpacity
                className="flex-row items-center flex-1 gap-3"
                onPress={() => toggleItem(item.id, item.is_done)}
            >
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${item.is_done ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                    {item.is_done && <MaterialIcons name="check" size={16} color="white" />}
                </View>
                <Text className={`text-base text-gray-900 dark:text-white ${item.is_done ? 'line-through text-gray-400' : ''}`}>
                    {item.label}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteItem(item.id)} className="p-2">
                <MaterialIcons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark edges={['bottom']}">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center p-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
                    {listName || 'Loading...'}
                </Text>
            </View>

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 p-4"
            >
                <View className="flex-row items-center gap-3">
                    <TextInput
                        className="flex-1 bg-gray-100 dark:bg-background-dark rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white"
                        placeholder="Add a new item..."
                        placeholderTextColor="#9ca3af"
                        value={newItemLabel}
                        onChangeText={setNewItemLabel}
                        onSubmitEditing={addItem}
                    />
                    <TouchableOpacity
                        onPress={addItem}
                        className="w-12 h-12 rounded-xl bg-primary items-center justify-center shadow-sm"
                    >
                        <MaterialIcons name="arrow-upward" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
