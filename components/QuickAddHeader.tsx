import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTasks } from '../hooks/useTasks';

interface QuickAddHeaderProps {
    listId: string;
}

export default function QuickAddHeader({ listId }: QuickAddHeaderProps) {
    const [title, setTitle] = useState('');
    const { createTask } = useTasks(listId);

    const suggestions = ["Milk", "Juice", "Bread", "Eggs", "Cheese"];

    const handleAdd = async (text: string = title) => {
        if (!text.trim()) return;
        await createTask(text.trim());
        setTitle('');
    };

    return (
        <View className="px-4 pb-2 pt-1 z-10 bg-background-dark">
            <View className="relative">
                <TextInput
                    className="w-full h-14 pl-5 pr-14 rounded-2xl bg-surface-dark text-base font-medium text-white placeholder:text-slate-500"
                    placeholder="Add item..."
                    placeholderTextColor="#64748b"
                    value={title}
                    onChangeText={setTitle}
                    onSubmitEditing={() => handleAdd()}
                    returnKeyType="done"
                />
                <TouchableOpacity
                    className="absolute right-2 top-2 h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md"
                    onPress={() => handleAdd()}
                >
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="mt-4 mb-2">
                <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Commonly Used</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 pb-2">
                    {suggestions.filter(s => s.toLowerCase().includes(title.toLowerCase())).map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="flex-row h-9 items-center justify-center gap-1.5 rounded-lg bg-surface-dark px-4 mr-2 border border-white/10"
                            onPress={() => handleAdd(item)}
                        >
                            <Text className="text-sm font-medium text-white">{item}</Text>
                            <MaterialIcons name="add" size={16} color="#3b82f6" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}
