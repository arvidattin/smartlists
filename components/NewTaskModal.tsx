import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTasks } from '../hooks/useTasks';

interface NewTaskModalProps {
    visible: boolean;
    onClose: () => void;
    listId: string;
}

export default function NewTaskModal({ visible, onClose, listId }: NewTaskModalProps) {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
    const [dueDate, setDueDate] = useState<string | null>(null);
    const [assigneeId, setAssigneeId] = useState<string | null>(null); // 'self' or null for MVP
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [tags, setTags] = useState<{ label: string; color: string }[]>([]);
    const [newTag, setNewTag] = useState('');
    const [tagColor, setTagColor] = useState('purple');
    const { createTask } = useTasks(listId);

    const handleCreate = async () => {
        if (!title.trim()) return;

        // Pass params. If 'self', we let useTasks handle it (or pass specific ID if we had it)
        // For MVP, if assigneeId is 'self', useTasks defaults to session user.
        await createTask(title.trim(), priority, dueDate, assigneeId, subtasks, tags);

        setTitle('');
        setPriority('normal');
        setDueDate(null);
        setAssigneeId(null);
        setSubtasks([]);
        setNewSubtask('');
        setTags([]);
        setNewTag('');
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-background-light dark:bg-background-dark">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between bg-background-light/80 dark:bg-background-dark/80 px-4 py-3 border-b border-gray-200 dark:border-gray-800 pt-12">
                        <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                            <MaterialIcons name="close" size={24} className="text-gray-600 dark:text-gray-400" />
                        </TouchableOpacity>
                        <Text className="text-base font-bold text-gray-900 dark:text-white">New Task</Text>
                        <TouchableOpacity className="h-9 items-center justify-center rounded-full bg-primary/10 px-4">
                            <Text className="text-primary font-bold text-sm">Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 p-4 gap-6">
                        {/* Description */}
                        <View>
                            <TextInput
                                className="w-full text-2xl font-semibold text-gray-900 dark:text-white min-h-[120px]"
                                placeholder="What needs to be done?"
                                placeholderTextColor="#9ca3af"
                                multiline
                                textAlignVertical="top"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Properties */}
                        <View className="gap-2">
                            <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Properties</Text>
                            {/* Assignee */}
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800"
                                onPress={() => {
                                    // TODO: Open Assignee Picker
                                    // For now, toggle self/empty
                                    setAssigneeId(prev => prev ? null : 'self');
                                }}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="h-8 w-8 rounded-full bg-primary/20 items-center justify-center">
                                        <MaterialIcons name="person" size={18} color="#135bec" />
                                    </View>
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white">Assignee</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="flex-row items-center gap-2 rounded-full bg-gray-100 dark:bg-black/40 pl-1 pr-3 py-1">
                                        {assigneeId ? (
                                            <>
                                                <View className="h-6 w-6 rounded-full bg-gray-300" />
                                                <Text className="text-xs font-medium text-gray-600 dark:text-gray-300">Me</Text>
                                            </>
                                        ) : (
                                            <Text className="text-xs font-medium text-gray-400 pl-2">Unassigned</Text>
                                        )}
                                    </View>
                                    <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>

                            {/* Due Date */}
                            <TouchableOpacity
                                className="flex-row items-center justify-between p-4"
                                onPress={() => {
                                    // Simple toggle for now: Today -> Tomorrow -> None
                                    const today = new Date().toISOString();
                                    const tomorrow = new Date(Date.now() + 86400000).toISOString();
                                    if (!dueDate) setDueDate(today);
                                    else if (new Date(dueDate).getDate() === new Date().getDate()) setDueDate(tomorrow);
                                    else setDueDate(null);
                                }}
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className="h-8 w-8 rounded-full bg-purple-500/20 items-center justify-center">
                                        <MaterialIcons name="calendar-today" size={18} color="#a855f7" />
                                    </View>
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white">Due Date</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-sm font-medium text-primary">
                                        {!dueDate ? 'None' : new Date(dueDate).getDate() === new Date().getDate() ? 'Today' : 'Tomorrow'}
                                    </Text>
                                    <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Priority */}
                        <View className="gap-2">
                            <View className="flex-row items-center justify-between px-1">
                                <Text className="text-xs font-bold uppercase tracking-wider text-gray-500">Priority</Text>
                                <Text className="text-xs font-medium text-primary" onPress={() => setPriority('normal')}>Clear</Text>
                            </View>
                            <View className="flex-row gap-3">
                                {(['low', 'normal', 'high'] as const).map((p) => (
                                    <TouchableOpacity
                                        key={p}
                                        className={`flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-white dark:bg-surface-dark p-3 shadow-sm border ${priority === p ? 'border-orange-500 bg-orange-500/10' : 'border-transparent'}`}
                                        onPress={() => setPriority(p)}
                                    >
                                        <View className="flex-row items-center gap-2">
                                            <MaterialIcons
                                                name="flag"
                                                size={24}
                                                color={p === 'low' ? '#22c55e' : p === 'normal' ? '#f97316' : '#ef4444'}
                                            />
                                            <Text className={`text-xs font-semibold capitalize ${p === 'low' ? 'text-green-500' : p === 'normal' ? 'text-orange-500' : 'text-red-500'}`}>{p}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        {/* Tags */}
                        <View className="gap-2">
                            <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Tags</Text>
                            <View className="flex-row items-center gap-2 mb-2">
                                <TextInput
                                    className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white"
                                    placeholder="Add tag..."
                                    placeholderTextColor="#9ca3af"
                                    value={newTag}
                                    onChangeText={setNewTag}
                                />
                                <View className="flex-row gap-1">
                                    {['purple', 'blue', 'orange', 'yellow'].map(c => (
                                        <TouchableOpacity
                                            key={c}
                                            onPress={() => setTagColor(c)}
                                            className={`h-8 w-8 rounded-full ${c === 'purple' ? 'bg-purple-500' : c === 'blue' ? 'bg-blue-500' : c === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'} ${tagColor === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                        />
                                    ))}
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (newTag.trim()) {
                                            setTags([...tags, { label: newTag.trim(), color: tagColor }]);
                                            setNewTag('');
                                        }
                                    }}
                                    className="h-11 w-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
                                >
                                    <MaterialIcons name="add" size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row flex-wrap gap-2">
                                {tags.map((tag, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => setTags(tags.filter((_, idx) => idx !== i))}
                                        className="rounded-md px-2 py-1 border"
                                        style={{
                                            backgroundColor: tag.color === 'purple' ? '#f3e8ff' : tag.color === 'orange' ? '#ffedd5' : tag.color === 'blue' ? '#dbeafe' : '#fef9c3',
                                            borderColor: tag.color === 'purple' ? 'rgba(126, 34, 206, 0.1)' : 'transparent'
                                        }}
                                    >
                                        <Text className="text-xs font-medium" style={{ color: tag.color === 'purple' ? '#7e22ce' : tag.color === 'orange' ? '#c2410c' : tag.color === 'blue' ? '#1d4ed8' : '#a16207' }}>
                                            {tag.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Bottom Button */}
                    <View className="absolute bottom-0 w-full p-4 pt-4 bg-background-light dark:bg-background-dark border-t border-transparent">
                        <TouchableOpacity
                            className="flex-row w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 shadow-lg shadow-primary/30"
                            onPress={handleCreate}
                            disabled={!title.trim()}
                            style={{ opacity: title.trim() ? 1 : 0.7 }}
                        >
                            <MaterialIcons name="check" size={24} color="white" />
                            <Text className="text-base font-bold text-white">Create Task</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal >
    );
}
