import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useComments } from '../hooks/useComments';

interface TaskCommentsModalProps {
    visible: boolean;
    onClose: () => void;
    taskId: string;
    taskTitle: string;
    listId: string;
}

export default function TaskCommentsModal({ visible, onClose, taskId, taskTitle, listId }: TaskCommentsModalProps) {
    const { comments, addComment } = useComments(taskId, listId);
    const [newMessage, setNewMessage] = useState('');

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        await addComment(newMessage.trim());
        setNewMessage('');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/40 justify-end">
                <View className="h-[80%] w-full bg-white dark:bg-background-dark rounded-t-3xl shadow-2xl flex-col">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1" numberOfLines={1}>
                            {taskTitle}
                        </Text>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 dark:bg-white/10 p-2 rounded-full">
                            <MaterialIcons name="close" size={24} className="text-gray-500 dark:text-gray-400" />
                        </TouchableOpacity>
                    </View>

                    {/* Comments List */}
                    <FlatList
                        data={comments}
                        keyExtractor={item => item.id}
                        className="flex-1 px-4"
                        contentContainerStyle={{ paddingVertical: 20 }}
                        renderItem={({ item }) => (
                            <View className="mb-4 flex-row gap-3">
                                <View className="h-8 w-8 rounded-full bg-primary/20 items-center justify-center">
                                    <Text className="text-xs font-bold text-primary">
                                        {item.user?.username?.[0].toUpperCase() || 'U'}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Text className="text-sm font-bold text-gray-900 dark:text-white">{item.user?.username || 'User'}</Text>
                                        <Text className="text-xs text-gray-500">
                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <View className="bg-gray-50 dark:bg-surface-dark p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-800 self-start">
                                        <Text className="text-base text-gray-800 dark:text-gray-200 leading-snug">{item.message}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View className="py-10 items-center">
                                <Text className="text-gray-400">No comments yet. Be the first!</Text>
                            </View>
                        }
                    />

                    {/* Input */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                    >
                        <View className="p-4 border-t border-gray-100 dark:border-gray-800 pb-8 bg-white dark:bg-background-dark">
                            <View className="flex-row items-end gap-3">
                                <TextInput
                                    className="flex-1 bg-gray-50 dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-white max-h-32"
                                    placeholder="Add a comment..."
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    value={newMessage}
                                    onChangeText={setNewMessage}
                                />
                                <TouchableOpacity
                                    onPress={handleSend}
                                    disabled={!newMessage.trim()}
                                    className={`h-12 w-12 items-center justify-center rounded-full ${newMessage.trim() ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                                >
                                    <MaterialIcons name="send" size={20} color={newMessage.trim() ? "white" : "#9ca3af"} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
}
