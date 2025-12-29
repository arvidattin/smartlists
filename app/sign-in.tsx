import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');

    async function signInWithEmail() {
        setLoading(true);
        setErrorMsg('');
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setLoading(false);
        } else {
            router.replace('/(tabs)');
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
                {errorMsg ? (
                    <View className="bg-red-50 border border-red-200 p-3 rounded-lg flex-row items-center">
                        <MaterialIcons name="error-outline" size={20} color="#dc2626" />
                        <Text className="text-red-700 ml-2 flex-1">{errorMsg}</Text>
                    </View>
                ) : null}
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
