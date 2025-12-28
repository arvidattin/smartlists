import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://dwkmtraqsmsbpqdbuscs.supabase.co'
const supabaseKey = 'sb_publishable_4Ymg67sPiSfwHngnOgCE1Q_-GMQhqQ0'

const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return AsyncStorage.getItem(key).catch((e) => {
            console.warn('Supabase auth storage error (getItem):', e);
            return null;
        });
    },
    setItem: (key: string, value: string) => {
        return AsyncStorage.setItem(key, value).catch((e) => {
            console.warn('Supabase auth storage error (setItem):', e);
        });
    },
    removeItem: (key: string) => {
        return AsyncStorage.removeItem(key).catch((e) => {
            console.warn('Supabase auth storage error (removeItem):', e);
        });
    },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

// AppState listener to handle token refresh
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})
