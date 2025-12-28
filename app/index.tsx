import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.replace('/(tabs)');
            } else {
                router.replace('/sign-in');
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                router.replace('/(tabs)');
            } else {
                router.replace('/sign-in');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
}
