import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function SignUp() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            Alert.alert(error.message);
            setLoading(false);
        } else {
            if (!session) {
                Alert.alert('Please check your inbox for email verification!');
            } else {
                // Setup profile or just redirect
            }
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
                <Text className="text-gray-500">Sign up to get started</Text>
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
                    onPress={signUpWithEmail}
                    disabled={loading}
                    className={`w-full bg-blue-600 rounded-lg p-4 mt-6 ${loading ? 'opacity-70' : ''}`}
                >
                    <Text className="text-center text-white font-semibold text-lg">
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center mt-4">
                    <Text className="text-gray-600">Already have an account? </Text>
                    <Pressable onPress={() => router.back()}>
                        <Text className="text-blue-600 font-semibold">Sign In</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}
