import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLists } from '../hooks/useLists';

type ListType = 'standard' | 'advanced';

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CreateListModal({ visible, onClose }: CreateListModalProps) {
    const [listType, setListType] = useState<ListType>('standard');
    const [title, setTitle] = useState('');
    const { createList } = useLists();

    const handleCreate = async () => {
        if (!title.trim()) return;
        await createList(title, listType);
        setTitle('');
        onClose();
    };

    const isAdvanced = listType === 'advanced';

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="w-full bg-background-light dark:bg-background-dark rounded-t-3xl overflow-hidden shadow-2xl h-[85%]"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-4 pt-6 pb-2 z-20">
                        <TouchableOpacity
                            onPress={onClose}
                            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10"
                        >
                            <MaterialIcons name="close" size={24} className="text-gray-500 dark:text-gray-400" />
                        </TouchableOpacity>
                        <Text className="text-base font-semibold text-gray-900 dark:text-white opacity-0">New List</Text>
                        <View className="h-10 w-10" />
                    </View>

                    <View className="flex-1 px-6 pt-4 pb-4">
                        {/* List Name Input */}
                        <View className="w-full mb-2">
                            <TextInput
                                autoFocus
                                value={title}
                                onChangeText={setTitle}
                                className="w-full bg-transparent text-3xl font-medium text-gray-900 dark:text-white"
                                placeholder="What are we planning?"
                                placeholderTextColor="#cbd5e1"
                                selectionColor="#135bec"
                                style={{ fontSize: 30 }} // Fallback for native wind sizing issues sometimes
                            />
                            <View className="h-0.5 w-full bg-transparent border-b-2 border-primary mt-2" />
                        </View>

                        <View className="flex-row justify-between items-start mb-8">
                            <Text className="text-sm text-gray-400 pt-1 leading-snug">
                                Examples: "Weekly Groceries", "Q4 Roadmap"
                            </Text>
                            <Text className="text-xs font-medium text-gray-400 pt-1">{title.length}/50</Text>
                        </View>

                        {/* Toggle */}
                        <View className="flex-row bg-gray-200 dark:bg-gray-800 p-1.5 rounded-xl mb-8">
                            <TouchableOpacity
                                onPress={() => setListType('standard')}
                                className={`flex-1 items-center py-2.5 rounded-lg ${!isAdvanced ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`text-sm font-semibold ${!isAdvanced ? 'text-primary' : 'text-gray-500'}`}>Standard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setListType('advanced')}
                                className={`flex-1 items-center py-2.5 rounded-lg ${isAdvanced ? 'bg-white shadow-sm' : ''}`}
                            >
                                <Text className={`text-sm font-semibold ${isAdvanced ? 'text-primary' : 'text-gray-500'}`}>Advanced</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Settings Section */}
                        <View className={`transition-all duration-300 ${!isAdvanced ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">List Settings</Text>

                            <View className="space-y-3 gap-3">
                                <TouchableOpacity disabled={!isAdvanced} className="w-full flex-row items-center justify-between p-4 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
                                            <MaterialIcons name="group" size={20} color="#135bec" />
                                        </View>
                                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">Assignees</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <View className="h-6 w-6 rounded-full bg-primary items-center justify-center ring-2 ring-white">
                                            <Text className="text-[10px] font-bold text-white">ME</Text>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity disabled={!isAdvanced} className="w-full flex-row items-center justify-between p-4 bg-white dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <View className="flex-row items-center gap-3">
                                        <View className="h-9 w-9 rounded-full bg-purple-50 dark:bg-purple-900/20 items-center justify-center">
                                            <MaterialIcons name="event" size={20} color="#a855f7" />
                                        </View>
                                        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">List Due Date</Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="text-sm text-gray-400 font-medium">No date</Text>
                                        <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text className="text-xs text-gray-400 mt-4 px-1 text-center opacity-80">
                                Advanced lists allow collaborative editing and due dates.
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className="p-6 pt-2 border-t border-transparent">
                        {/* Create Button */}
                        <TouchableOpacity
                            className={`py-4 rounded-xl items-center justify-center shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all bg-primary`}
                            onPress={handleCreate}
                            disabled={!title.trim()}
                            style={{ opacity: title.trim() ? 1 : 0.7 }}
                        >
                            <Text className="text-white font-bold text-lg">Create List</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="h-8" />
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
