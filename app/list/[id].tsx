import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StatusBar, Text, TouchableOpacity, UIManager, View } from 'react-native';
import AdvancedListItem from '../../components/AdvancedListItem';
import InviteUserModal from '../../components/InviteUserModal';
import ListSettingsModal from '../../components/ListSettingsModal';
import NewTaskModal from '../../components/NewTaskModal';
import QuickAddHeader from '../../components/QuickAddHeader';
import StandardListItem from '../../components/StandardListItem';
import { useLists } from '../../hooks/useLists';
import { useTasks } from '../../hooks/useTasks';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function ListDetails() {
    const router = useRouter();
    const { id, type, title } = useLocalSearchParams<{ id: string; type: 'advanced' | 'standard'; title: string }>();
    const [newTaskVisible, setNewTaskVisible] = useState(false);
    const [inviteVisible, setInviteVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [animatingTasks, setAnimatingTasks] = useState<Set<string>>(new Set());

    const { lists, updateList, deleteList } = useLists();
    const list = lists.find(l => l.id === id);

    useEffect(() => {
        if (!list && lists.length > 0) {
            router.replace('/(tabs)');
        }
    }, [list, lists]);

    // Fetch Real Data
    const { tasks, loading, toggleTask } = useTasks(id);

    const handleToggle = (taskId: string, currentStatus: boolean) => {
        setAnimatingTasks(prev => {
            const next = new Set(prev);
            next.add(taskId);
            return next;
        });

        setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            toggleTask(taskId, currentStatus);
            setAnimatingTasks(prev => {
                const next = new Set(prev);
                next.delete(taskId);
                return next;
            });
        }, 1000);
    };

    const isAdvanced = type === 'advanced';
    const listTitle = list?.title || title || (isAdvanced ? "Work Tasks" : "Grocery Shopping");

    // Helper to filter completed/active
    const activeTasks = tasks.filter(t => !t.status);
    const completedTasks = tasks.filter(t => t.status);

    return (
        <View className={`flex-1 ${isAdvanced ? 'bg-background-light dark:bg-background-dark' : 'bg-background-dark'}`}>
            <StatusBar barStyle={isAdvanced ? "dark-content" : "light-content"} />

            {/* Header */}
            <View className={`px-4 pt-14 pb-4 border-b z-20 ${isAdvanced ? 'bg-background-light/95 dark:bg-background-dark/95 border-gray-200/50 dark:border-gray-800/50' : 'bg-background-dark border-transparent'}`}>
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.replace('/(tabs)');
                            }
                        }}
                        className="h-12 w-12 items-center justify-center -ml-2 rounded-full active:bg-gray-100/10"
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <MaterialIcons name="arrow-back-ios" size={22} color={isAdvanced ? "#6b7280" : "white"} style={{ marginLeft: 6 }} />
                    </TouchableOpacity>

                    <View className="flex-row gap-3">


                        {/* Invite Button */}
                        <TouchableOpacity
                            className="h-10 w-10 items-center justify-center"
                            onPress={() => setInviteVisible(true)}
                        >
                            <MaterialIcons name="person-add" size={24} color={isAdvanced ? "#6b7280" : "white"} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="h-10 w-10 items-center justify-center"
                            onPress={() => setSettingsVisible(true)}
                        >
                            <MaterialIcons name="more-horiz" size={24} color={isAdvanced ? "#6b7280" : "white"} />
                        </TouchableOpacity>
                    </View>
                </View>

                {isAdvanced ? (
                    <View className="flex-col gap-2">
                        <View className="self-start rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 border border-red-200 dark:border-red-800/50 flex-row items-center gap-1.5">
                            <MaterialIcons name="timer" size={16} color="#b91c1c" />
                            <Text className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Due Soon</Text>
                        </View>
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{listTitle}</Text>
                        <View className="flex-row items-center gap-2 text-sm text-gray-500 mt-1">
                            <Text className="font-medium text-gray-500">{activeTasks.length} items</Text>
                            <Text className="text-gray-500">•</Text>
                            <View className="flex-row -space-x-2">
                                {/* Avatars Placeholder */}
                                <View className="h-6 w-6 rounded-full bg-gray-300 ring-2 ring-white items-center justify-center">
                                    <Text className="text-[8px] font-bold text-gray-600">ME</Text>
                                </View>
                                {/* Add Member Button (Small) */}
                                <TouchableOpacity onPress={() => setInviteVisible(true)} className="h-6 w-6 rounded-full bg-gray-100 ring-2 ring-white items-center justify-center">
                                    <MaterialIcons name="add" size={14} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="items-center">
                        <Text className="text-lg font-bold text-white">{listTitle}</Text>
                        <View className="flex-row -space-x-2 mt-2">
                            <View className="h-8 w-8 rounded-full bg-gray-300 ring-2 ring-background-dark" />
                        </View>
                    </View>
                )}
            </View>

            {/* Content */}
            <View className="flex-1">
                {!isAdvanced && <QuickAddHeader listId={id} />}

                <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                    {loading && <Text className="text-gray-400 text-center mt-4">Loading tasks...</Text>}

                    {isAdvanced ? (
                        <>
                            {activeTasks.map(task => (
                                <AdvancedListItem
                                    key={task.id}
                                    id={task.id}
                                    listId={id}
                                    title={task.title}
                                    completed={animatingTasks.has(task.id) ? !task.status : task.status}
                                    priority={task.priority || 'normal'}
                                    dueDate={task.due_date}
                                    onToggle={() => handleToggle(task.id, task.status)}
                                    subtasks={task.subtasks}
                                    tags={task.tags as any || []}
                                    features={list?.features as any}
                                    Updates={task.updates?.map(u => ({
                                        message: u.message,
                                        userInitials: u.user?.full_name ? u.user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?',
                                        userAvatar: u.user?.avatar_url || undefined,
                                        userName: u.user?.full_name || u.user?.username || 'Unknown',
                                        time: u.created_at,
                                        type: u.type // We will add this to the interface in next step
                                    }))}
                                />
                            ))}
                            {activeTasks.length === 0 && !loading && (
                                <Text className="text-gray-400 text-center mt-10">No tasks yet. Create one!</Text>
                            )}
                        </>
                    ) : (
                        <View className="gap-2">
                            {activeTasks.map(task => (
                                <StandardListItem
                                    key={task.id}
                                    id={task.id}
                                    listId={id}
                                    title={task.title}
                                    completed={animatingTasks.has(task.id) ? !task.status : task.status}
                                    onToggle={() => handleToggle(task.id, task.status)}
                                    Updates={task.updates?.map(u => ({
                                        message: u.message,
                                        type: u.type
                                    }))}
                                />
                            ))}

                            {activeTasks.length === 0 && !loading && (
                                <Text className="text-gray-400 text-center mt-10">No items needed.</Text>
                            )}

                            {completedTasks.length > 0 && (
                                <View className="mt-8 mb-2 flex-row justify-between opacity-60">
                                    <Text className="text-xs font-bold uppercase text-slate-500">Completed</Text>
                                    <Text className="text-xs font-medium text-slate-400">{completedTasks.length} items</Text>
                                </View>
                            )}

                            {completedTasks.map(task => (
                                <StandardListItem
                                    key={task.id}
                                    id={task.id}
                                    listId={id}
                                    title={task.title}
                                    completed={animatingTasks.has(task.id) ? !task.status : task.status}
                                    onToggle={() => handleToggle(task.id, task.status)}
                                    Updates={task.updates?.map(u => ({
                                        message: u.message,
                                        type: u.type
                                    }))}
                                />

                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* FAB (Only for Advanced) */}
            {isAdvanced && (
                <TouchableOpacity
                    className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/40"
                    onPress={() => setNewTaskVisible(true)}
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            )}

            {/* Background Gradient for Advanced */}
            {isAdvanced && (
                <View pointerEvents="none" className="absolute bottom-0 left-0 right-0 h-20 bg-transparent" />
            )}

            <NewTaskModal
                visible={newTaskVisible}
                onClose={() => setNewTaskVisible(false)}
                listId={id}
            />

            <InviteUserModal
                visible={inviteVisible}
                onClose={() => setInviteVisible(false)}
                listId={id}
                listTitle={listTitle}
            />

            <ListSettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
                listId={id}
                currentTitle={listTitle}
                currentType={list?.type || (isAdvanced ? 'advanced' : 'standard')}
                currentFeatures={list?.features}
                currentIconName={list?.icon_name || (isAdvanced ? 'work' : 'list')}
                currentIconColor={list?.icon_color || '#6366f1'}
                updateList={updateList}
                deleteList={deleteList}
            />
        </View>
    );
}
