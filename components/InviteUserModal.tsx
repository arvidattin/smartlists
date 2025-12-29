import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

interface InviteUserModalProps {
    visible: boolean;
    onClose: () => void;
    listId: string;
    listTitle: string;
}

export default function InviteUserModal({ visible, onClose, listId, listTitle }: InviteUserModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleInvite = async () => {
        if (!email.trim()) return;
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // 1. Find user by email (in a real app, you'd likely query a 'public_users' view or use an Edge Function to avoid exposing emails)
            // For this demo, we'll try to find an exact match in profiles if referencing by username/email is supported, 
            // OR we just insert blindly if your RLS allows it. 
            // Since accessing auth.users directly is restricted, we rely on the `profiles` table which we can query.

            /* 
               NOTE: To fully implement email invites securely, you usually use a Supabase Edge Function to look up the ID properly.
               Here, we will assume we can query profiles by username (as a proxy for email) or exact email if you stored it in profiles.
               Let's assume the user enters a 'username' for now as defined in our schema, OR we check if we stored email in profile.
               Our schema has 'username'.
            */

            // Check if user exists (mock logic update -> checking profiles)
            // We need to look up the UUID for the given username/email
            const { data: users, error: searchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', email.split('@')[0]) // Simplified matching: assume input is username
                .single();

            if (searchError || !users) {
                setStatus('error');
                setMessage('User not found. Try their username.');
                setLoading(false);
                return;
            }

            const userIdToInvite = users.id;

            // 2. Insert into list_members
            const { error: inviteError } = await supabase
                .from('list_members')
                .insert({
                    list_id: listId,
                    user_id: userIdToInvite,
                    role: 'editor',
                    status: 'pending'
                });

            if (inviteError) {
                if (inviteError.code === '23505') { // Unique violation
                    setStatus('error');
                    setMessage('User is already invited.');
                } else {
                    throw inviteError;
                }
            } else {
                setStatus('success');
                setMessage(`Successfully invited ${email}!`);
                setTimeout(() => {
                    onClose();
                    setEmail('');
                    setStatus('idle');
                }, 1500);
            }

        } catch (e) {
            console.error(e);
            setStatus('error');
            setMessage('Failed to send invite.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/40 px-4">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="w-full bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-xl"
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white">Invite to {listTitle}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} className="text-gray-500" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-sm text-gray-500 mb-4">
                        Enter the username of the person you want to collaborate with.
                    </Text>

                    <TextInput
                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white mb-4"
                        placeholder="Username (e.g. arvid)"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    {message ? (
                        <View className={`mb-4 p-3 rounded-lg flex-row items-center gap-2 ${status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                            <MaterialIcons
                                name={status === 'success' ? 'check-circle' : 'error'}
                                size={20}
                                color={status === 'success' ? '#16a34a' : '#ef4444'}
                            />
                            <Text className={`text-sm font-medium ${status === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                {message}
                            </Text>
                        </View>
                    ) : null}

                    <TouchableOpacity
                        className={`w-full py-3 rounded-xl items-center justify-center bg-primary ${loading ? 'opacity-70' : ''}`}
                        onPress={handleInvite}
                        disabled={loading || !email.trim()}
                    >
                        {loading ? (
                            <Text className="text-white font-bold">Sending...</Text>
                        ) : (
                            <Text className="text-white font-bold">Send Invite</Text>
                        )}
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
