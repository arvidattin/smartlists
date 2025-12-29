import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import TaskCommentsModal from './TaskCommentsModal';

interface Update {
    message: string;
    type?: 'comment' | 'log';
}

interface StandardListItemProps {
    id: string;
    title: string;
    completed?: boolean;
    Updates?: Update[];
    onToggle?: () => void;
}

export default function StandardListItem({ id, title, completed = false, Updates = [], onToggle, listId }: StandardListItemProps & { listId: string }) {
    const [modalVisible, setModalVisible] = useState(false);

    const comments = Updates.filter(u => u.type === 'comment' || !u.type);
    const latestComment = comments[0];
    const count = comments.length;

    return (
        <>
            <View className="flex-col p-4 bg-white dark:bg-surface-dark rounded-2xl mb-2 shadow-sm border border-gray-100 dark:border-transparent">
                <View className="flex-row items-start gap-4">
                    <View className="flex h-6 w-6 shrink-0 items-center justify-center mt-0.5">
                        <TouchableOpacity
                            onPress={onToggle}
                            className={`h-6 w-6 rounded-full border-2 items-center justify-center ${completed ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-transparent'}`}
                        >
                            {completed && <MaterialIcons name="check" size={16} color="white" />}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                            <Text className={`text-base font-medium flex-1 ${completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{title}</Text>
                            {!latestComment && (
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <MaterialIcons
                                        name="chat-bubble-outline"
                                        size={18}
                                        color="#475569"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {latestComment && (
                    <View className="pl-10 mt-2">
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="flex-row gap-2 items-center"
                        >
                            <View className="flex-row items-center gap-2 flex-1">
                                <MaterialIcons name="chat-bubble-outline" size={14} color="#9ca3af" />
                                <Text className="text-xs text-gray-500 line-clamp-1 italic flex-1" numberOfLines={1}>
                                    "{latestComment.message}"
                                </Text>
                            </View>
                            {count > 1 && (
                                <Text className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                    +{count - 1} more
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <TaskCommentsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                taskId={id}
                taskTitle={title}
                listId={listId}
            />
        </>
    ); // Fixed syntax
}
