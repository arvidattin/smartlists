import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import TaskCommentsModal from './TaskCommentsModal';

interface Tag {
    label: string;
    color: string; // e.g., 'purple', 'orange'
}

interface Update {
    userInitials?: string;
    userAvatar?: string;
    userName?: string;
    time?: string;
    message: string;
    isTyping?: boolean;
    type?: 'comment' | 'log';
}

interface AdvancedListItemProps {
    id: string; // Added id
    title: string;
    tags?: Tag[];
    Updates?: Update[];
    completed?: boolean;
    dueDate?: string | null;
    priority?: 'low' | 'normal' | 'high';
    subtasks?: any[]; // Simplified for display
    onToggle?: () => void;
    features?: {
        tags?: boolean;
        priority?: boolean;
        comments?: boolean;
        due_date?: boolean;
    };
}

export default function AdvancedListItem({
    id, title, tags = [], Updates = [], completed = false, dueDate, priority = 'normal', subtasks = [], onToggle,
    features = { tags: true, priority: true, comments: true, due_date: true }, listId
}: AdvancedListItemProps & { listId: string }) {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <View className="flex-col rounded-2xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-4">
                <View className="flex-row items-start gap-4">
                    <View className="flex h-6 w-6 shrink-0 items-center justify-center mt-0.5">
                        <TouchableOpacity
                            onPress={onToggle}
                            className={`h-6 w-6 rounded-full border-2 items-center justify-center ${completed ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            {completed && <MaterialIcons name="check" size={16} color="white" />}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 flex-col gap-1.5">
                        <View className="flex-row items-start justify-between gap-2">
                            <Text className="text-gray-900 dark:text-white text-base font-semibold leading-snug flex-1">{title}</Text>
                            {features.comments && (!Updates || Updates.filter(u => u.type === 'comment' || !u.type).length === 0) && (
                                <TouchableOpacity onPress={() => setModalVisible(true)} className="pt-0.5">
                                    <MaterialIcons name="chat-bubble-outline" size={18} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Tags (Custom + Due Date) */}
                        <View className="flex-row gap-2 flex-wrap">
                            {features.due_date && dueDate && (
                                <View className="flex-row items-center gap-1 rounded-md px-2 py-0.5 bg-purple-50 border border-purple-100">
                                    <MaterialIcons name="event" size={12} color="#a855f7" />
                                    <Text className="text-xs font-medium text-purple-700">
                                        {new Date(dueDate).getDate() === new Date().getDate() ? 'Today' : new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                            )}

                            {features.priority && priority !== 'normal' && (
                                <View className={`flex-row items-center gap-1 rounded-md px-2 py-0.5 border ${priority === 'high' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                    <MaterialIcons name="flag" size={12} color={priority === 'high' ? '#ef4444' : '#22c55e'} />
                                    <Text className={`text-xs font-medium ${priority === 'high' ? 'text-red-700' : 'text-green-700'}`}>
                                        {priority.toUpperCase()}
                                    </Text>
                                </View>
                            )}

                            {subtasks && subtasks.length > 0 && (
                                <View className="flex-row items-center gap-1 rounded-md px-2 py-0.5 bg-blue-50 border border-blue-100">
                                    <MaterialIcons name="checklist" size={12} color="#3b82f6" />
                                    <Text className="text-xs font-medium text-blue-700">
                                        {subtasks.filter(s => s.completed).length}/{subtasks.length}
                                    </Text>
                                </View>
                            )}

                            {features.tags && tags.map((tag, i) => (
                                <View
                                    key={i}
                                    className={`rounded-md px-2 py-0.5 border border-transparent`}
                                    style={{
                                        backgroundColor: tag.color === 'purple' ? '#f3e8ff' : tag.color === 'orange' ? '#ffedd5' : tag.color === 'blue' ? '#dbeafe' : tag.color === 'yellow' ? '#fef9c3' : '#f3f4f6',
                                        borderColor: tag.color === 'purple' ? 'rgba(126, 34, 206, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Text
                                        className="text-xs font-medium"
                                        style={{ color: tag.color === 'purple' ? '#7e22ce' : tag.color === 'orange' ? '#c2410c' : tag.color === 'blue' ? '#1d4ed8' : tag.color === 'yellow' ? '#a16207' : '#4b5563' }}
                                    >
                                        {tag.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {features.comments && (() => {
                    const comments = Updates.filter(u => u.type === 'comment' || !u.type);
                    const latestComment = comments[0];
                    const count = comments.length;

                    if (latestComment) {
                        return (
                            <>
                                <View className="my-3 h-[1px] w-full bg-gray-100 dark:bg-gray-800" />
                                <View className="flex-col gap-3 pl-10">
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                        className="flex-row gap-2 items-center mt-1"
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
                            </>
                        );
                    }
                    return null;
                })()}
            </View>

            <TaskCommentsModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                taskId={id}
                taskTitle={title}
                listId={listId}
            />
        </>
    );
}
