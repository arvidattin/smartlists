import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Modal, Switch, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface ProfileModalProps {
    visible: boolean;
    onClose: () => void;
    userEmail?: string;
}

export default function ProfileModal({ visible, onClose, userEmail }: ProfileModalProps) {
    const router = useRouter();
    const { colorScheme, toggleColorScheme } = useColorScheme();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        onClose();
        router.replace('/sign-in');
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="flex-1 justify-end bg-black/40"
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={e => e.stopPropagation()}
                    className="w-full bg-white dark:bg-background-dark rounded-t-3xl p-6 shadow-2xl"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-8">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">Profile & Settings</Text>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 dark:bg-white/10 p-2 rounded-full">
                            <MaterialIcons name="keyboard-arrow-down" size={24} className="text-gray-500 dark:text-gray-400" />
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <View className="flex-row items-center gap-4 mb-8">
                        <View className="h-16 w-16 rounded-full bg-primary items-center justify-center ring-4 ring-blue-50 dark:ring-blue-900/20">
                            <Text className="text-2xl font-bold text-white">
                                {userEmail?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                {userEmail?.split('@')[0] || 'User'}
                            </Text>
                            <Text className="text-sm text-gray-500">{userEmail}</Text>
                        </View>
                    </View>

                    {/* Settings Options */}
                    <View className="gap-2 mb-8">
                        {/* Appearance */}
                        <View className="flex-row items-center justify-between p-4 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800">
                            <View className="flex-row items-center gap-3">
                                <View className={`p-2 rounded-full ${colorScheme === 'dark' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-orange-100'}`}>
                                    <MaterialIcons
                                        name={colorScheme === 'dark' ? 'dark-mode' : 'light-mode'}
                                        size={20}
                                        color={colorScheme === 'dark' ? '#a855f7' : '#f97316'}
                                    />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">Dark Mode</Text>
                            </View>
                            <Switch
                                value={colorScheme === 'dark'}
                                onValueChange={toggleColorScheme}
                                trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
                                thumbColor={'white'}
                            />
                        </View>

                        {/* Notifications (Placeholder) */}
                        <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 dark:bg-surface-dark rounded-xl border border-gray-100 dark:border-gray-800">
                            <View className="flex-row items-center gap-3">
                                <View className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <MaterialIcons name="notifications" size={20} color="#3b82f6" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">Notifications</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Sign Out */}
                    <TouchableOpacity
                        onPress={handleSignOut}
                        className="flex-row items-center justify-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 active:bg-red-100 transition-colors"
                    >
                        <MaterialIcons name="logout" size={20} color="#ef4444" />
                        <Text className="text-base font-bold text-red-600 dark:text-red-400">Sign Out</Text>
                    </TouchableOpacity>
                    <View className="h-6" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
