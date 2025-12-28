import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Step = 'selection' | 'standard-form' | 'advanced-form';

interface CreateListModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function CreateListModal({ visible, onClose }: CreateListModalProps) {
    const [step, setStep] = useState<Step>('selection');

    const resetAndClose = () => {
        setStep('selection');
        onClose();
    };

    const renderSelectionStep = () => (
        <View className="flex-col gap-4">
            <Text className="text-sm text-gray-500 mb-2">Choose the type of list you want to create.</Text>

            <TouchableOpacity
                className="flex-row items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                onPress={() => setStep('standard-form')}
            >
                <View className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100">
                    <MaterialIcons name="checklist" size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-gray-900">Create Standard List</Text>
                    <Text className="text-xs text-gray-500 mt-1">Simple checklist for groceries, quick tasks, or daily reminders.</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                className="flex-row items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
                onPress={() => setStep('advanced-form')}
            >
                <View className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100">
                    <MaterialIcons name="assignment-turned-in" size={24} color="#9333ea" />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-gray-900">Create Advanced List</Text>
                    <Text className="text-xs text-gray-500 mt-1">Detailed projects with descriptions, tags, assignees and due dates.</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderStandardForm = () => (
        <View className="flex-col gap-5">
            <TouchableOpacity
                className="flex-row items-center gap-2 mb-2"
                onPress={() => setStep('selection')}
            >
                <MaterialIcons name="arrow-back" size={14} color="#6b7280" />
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">Back to selection</Text>
            </TouchableOpacity>

            <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">List Name</Text>
                <TextInput
                    className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                    placeholder="e.g., Grocery Run"
                />
            </View>

            <View className="pt-2">
                <TouchableOpacity className="flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 shadow-sm">
                    <Text className="text-sm font-semibold text-white">Create List</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderAdvancedForm = () => (
        <View className="flex-col gap-5">
            <TouchableOpacity
                className="flex-row items-center gap-2 mb-2"
                onPress={() => setStep('selection')}
            >
                <MaterialIcons name="arrow-back" size={14} color="#6b7280" />
                <Text className="text-xs font-medium uppercase tracking-wide text-gray-500">Back to selection</Text>
            </TouchableOpacity>

            <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">List Name</Text>
                <TextInput
                    className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
                    placeholder="e.g., Q4 Marketing Plan"
                />
            </View>

            <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">Description <Text className="text-gray-400 font-normal">(Optional)</Text></Text>
                <TextInput
                    className="block w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 h-24"
                    placeholder="Briefly describe the purpose..."
                    multiline
                    textAlignVertical="top"
                />
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Tags</Text>
                    <View className="relative">
                        <TouchableOpacity className="w-full rounded-lg bg-white p-3 border border-gray-300">
                            <Text className="text-gray-400">Select tags</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Due Date</Text>
                    <View className="relative">
                        <TouchableOpacity className="w-full rounded-lg bg-white p-3 border border-gray-300">
                            <Text className="text-gray-400">Select date</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="pt-2">
                <TouchableOpacity className="flex items-center justify-center rounded-xl bg-primary px-4 py-3.5 shadow-sm">
                    <Text className="text-sm font-semibold text-white">Create Advanced List</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={resetAndClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 justify-end"
            >
                {/* Backdrop */}
                <TouchableOpacity
                    className="absolute inset-0 bg-black/40"
                    activeOpacity={1}
                    onPress={resetAndClose}
                />

                {/* Modal Content */}
                <View className="bg-white rounded-t-2xl p-6 w-full max-h-[90%]">
                    <View className="mb-5 flex-row items-center justify-between">
                        <Text className="text-lg font-bold text-gray-900">Create New List</Text>
                        <TouchableOpacity onPress={resetAndClose} className="p-1 bg-gray-100 rounded-full">
                            <MaterialIcons name="close" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {step === 'selection' && renderSelectionStep()}
                    {step === 'standard-form' && renderStandardForm()}
                    {step === 'advanced-form' && renderAdvancedForm()}

                    {/* Safe area spacer for bottom on iPhone X+ */}
                    <View className="h-8" />
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
