import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
    onListCreated: () => void;
}

type Step = 'selection' | 'standard' | 'advanced';

export default function CreateListModal({ visible, onClose, onListCreated }: CreateListModalProps) {
    const [step, setStep] = useState<Step>('selection');
    const [loading, setLoading] = useState(false);

    // Standard form state
    const [stdName, setStdName] = useState('');

    // Advanced form state
    const [advName, setAdvName] = useState('');
    const [advDesc, setAdvDesc] = useState('');

    const resetInternalState = () => {
        setStep('selection');
        setStdName('');
        setAdvName('');
        setAdvDesc('');
    };

    const handleClose = () => {
        onClose();
        // specific timing might be needed if animating, but for now:
        resetInternalState();
    };

    const createList = async (type: 'standard' | 'advanced') => {
        const name = type === 'standard' ? stdName : advName;
        if (!name.trim()) return;

        setLoading(true);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw new Error('User not authenticated');

            // Atomic creation via RPC
            const { data: listId, error: rpcError } = await supabase
                .rpc('create_list', {
                    name_input: name,
                    type_input: type
                });

            if (rpcError) throw rpcError;

            onListCreated();
            handleClose();
        } catch (e) {
            console.error('Error creating list:', e);
            alert('Failed to create list. Ensure you are signed in and have permissions.');
        } finally {
            setLoading(false);
        }
    };

    const renderSelection = () => (
        <View className="flex-col gap-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-2">
                Choose the type of list you want to create.
            </Text>

            <TouchableOpacity
                className="flex-row items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-background-dark p-4 active:bg-gray-100"
                onPress={() => setStep('standard')}
            >
                <View className="h-14 w-14 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                    <MaterialIcons name="playlist-add-check" size={24} className="text-green-600 dark:text-green-400" color="#16a34a" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-gray-900 dark:text-white">Create Standard List</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Simple checklist for groceries, quick tasks, or daily reminders.
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                className="flex-row items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-background-dark p-4 active:bg-gray-100"
                onPress={() => setStep('advanced')}
            >
                <View className="h-14 w-14 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                    <MaterialIcons name="assignment-turned-in" size={24} className="text-purple-600 dark:text-purple-400" color="#9333ea" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-gray-900 dark:text-white">Create Advanced List</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Detailed projects with descriptions, tags, assignees and due dates.
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderStandardForm = () => (
        <View className="flex-col gap-5">
            <TouchableOpacity
                className="flex-row items-center gap-2 -mt-1 mb-2"
                onPress={() => setStep('selection')}
            >
                <MaterialIcons name="arrow-back" size={14} color="#6b7280" />
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">Back to selection</Text>
            </TouchableOpacity>

            <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">List Name</Text>
                <TextInput
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark px-4 py-3 text-base text-gray-900 dark:text-white"
                    placeholder="e.g., Grocery Run"
                    placeholderTextColor="#9ca3af"
                    value={stdName}
                    onChangeText={setStdName}
                    autoFocus
                />
            </View>

            <View className="pt-2">
                <TouchableOpacity
                    className={`flex-row items-center justify-center rounded-xl bg-primary px-4 py-3.5 shadow-sm ${loading ? 'opacity-70' : ''}`}
                    onPress={() => createList('standard')}
                    disabled={loading}
                >
                    <Text className="text-sm font-semibold text-white">Create List</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAdvancedForm = () => (
        <View className="flex-col gap-5">
            <TouchableOpacity
                className="flex-row items-center gap-2 -mt-1 mb-2"
                onPress={() => setStep('selection')}
            >
                <MaterialIcons name="arrow-back" size={14} color="#6b7280" />
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">Back to selection</Text>
            </TouchableOpacity>

            <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">List Name</Text>
                <TextInput
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark px-4 py-3 text-base text-gray-900 dark:text-white"
                    placeholder="e.g., Q4 Marketing Plan"
                    placeholderTextColor="#9ca3af"
                    value={advName}
                    onChangeText={setAdvName}
                />
            </View>

            <View>
                <View className="flex-row">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description </Text>
                    <Text className="text-sm font-normal text-gray-400 mb-1.5">(Optional)</Text>
                </View>
                <TextInput
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-background-dark px-4 py-3 text-base text-gray-900 dark:text-white h-24"
                    placeholder="Briefly describe the purpose..."
                    placeholderTextColor="#9ca3af"
                    value={advDesc}
                    onChangeText={setAdvDesc}
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</Text>
                    <TouchableOpacity className="w-full rounded-lg bg-white dark:bg-background-dark py-3 px-3 border border-gray-300 dark:border-gray-700 flex-row justify-between items-center">
                        <Text className="text-gray-400">Select tags</Text>
                        <MaterialIcons name="expand-more" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</Text>
                    <TouchableOpacity className="w-full rounded-lg bg-white dark:bg-background-dark py-3 px-3 border border-gray-300 dark:border-gray-700">
                        <Text className="text-gray-400">mm/dd/yyyy</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="pt-2">
                <TouchableOpacity
                    className={`flex-row items-center justify-center rounded-xl bg-primary px-4 py-3.5 shadow-sm ${loading ? 'opacity-70' : ''}`}
                    onPress={() => createList('advanced')}
                    disabled={loading}
                >
                    <Text className="text-sm font-semibold text-white">Create Advanced List</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <TouchableOpacity
                    className="absolute inset-0"
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <View
                    className={`w-full bg-white dark:bg-surface-dark rounded-t-2xl p-6 shadow-2xl ${Platform.OS === 'ios' ? 'mb-0 pb-10' : 'pb-6'
                        }`}
                >
                    <View className="mb-5 flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">Create New List</Text>
                        <TouchableOpacity
                            className="rounded-full p-1 bg-gray-100 dark:bg-gray-800"
                            onPress={handleClose}
                        >
                            <MaterialIcons name="close" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {step === 'selection' && renderSelection()}
                    {step === 'standard' && renderStandardForm()}
                    {step === 'advanced' && renderAdvancedForm()}

                </View>
            </View>
        </Modal>
    );
}
