import { supabase } from '@/lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) Alert.alert('Sign In Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.signUp({
            email,
            password,
            // If you need email confirmation, this will pause here.
            // For this demo, assuming auto-confirm or user checks email.
        });

        if (error) Alert.alert('Sign Up Error', error.message);
        else if (!session) Alert.alert('Success', 'Please check your inbox for email verification!');

        setLoading(false);
    }

    return (
        <View className="flex-1 items-center justify-center p-5 bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
            <View className="w-full max-w-sm">
                <View className="items-center mb-10">
                    <View className="h-20 w-20 bg-blue-600/10 rounded-3xl items-center justify-center mb-4 rotate-3" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)' }}>
                        <MaterialIcons name="check-circle" size={48} color="#135bec" />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 font-display-bold tracking-tight" style={{ color: '#111827' }}>
                        SmartLists
                    </Text>
                    <Text className="text-gray-500 mt-2 font-display text-center" style={{ color: '#6b7280' }}>
                        Organize your life with intelligent task management.
                    </Text>
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100" style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', borderWidth: 1 }}>
                    <Text className="text-xl font-bold text-gray-900 mb-6" style={{ color: '#111827' }}>
                        {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                    </Text>

                    <View className="space-y-4 gap-4">
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1" style={{ color: '#374151' }}>Email</Text>
                            <TextInput
                                className="w-full rounded-xl bg-gray-100 border border-gray-300 px-4 py-3.5 text-black"
                                style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db', borderWidth: 1, color: '#000000' }}
                                placeholder="john@example.com"
                                placeholderTextColor="#6b7280"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1.5 ml-1" style={{ color: '#374151' }}>Password</Text>
                            <TextInput
                                className="w-full rounded-xl bg-gray-100 border border-gray-300 px-4 py-3.5 text-black"
                                style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db', borderWidth: 1, color: '#000000' }}
                                placeholder="••••••••"
                                placeholderTextColor="#6b7280"
                                secureTextEntry
                                autoCapitalize="none"
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            className={`w-full bg-blue-600 rounded-xl py-4 mt-2 ${loading ? 'opacity-70' : ''}`}
                            style={{ backgroundColor: '#2563eb', opacity: loading ? 0.7 : 1 }}
                            onPress={mode === 'signin' ? signInWithEmail : signUpWithEmail}
                            disabled={loading}
                        >
                            <Text className="text-white text-center font-bold text-base" style={{ color: '#ffffff', textAlign: 'center', fontWeight: 'bold' }}>
                                {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-6 flex-row justify-center">
                        <Text className="text-gray-500" style={{ color: '#6b7280' }}>{mode === 'signin' ? "Don't have an account? " : "Already have an account? "}</Text>
                        <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
                            <Text className="text-primary font-bold" style={{ color: '#2563eb', fontWeight: 'bold' }}>{mode === 'signin' ? 'Sign Up' : 'Sign In'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
