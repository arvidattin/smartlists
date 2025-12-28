import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert(error.message);
            setLoading(false);
        } else {
            // Auth listener in index/layout handles redirect, but we can double check
            // router.replace('/(tabs)');
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
                <Text className="text-gray-500">Sign in to your account</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                    <TextInput
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900"
                        placeholder="john@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                    <TextInput
                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900"
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    onPress={signInWithEmail}
                    disabled={loading}
                    className={`w-full bg-blue-600 rounded-lg p-4 mt-6 ${loading ? 'opacity-70' : ''}`}
                >
                    <Text className="text-center text-white font-semibold text-lg">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-gray-600">Don't have an account? </Text>
                    <Pressable onPress={() => router.push('/sign-up')}>
                        <Text className="text-blue-600 font-semibold">Sign Up</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
