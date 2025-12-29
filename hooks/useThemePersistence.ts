import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';

export function useThemePersistence() {
    const { colorScheme, setColorScheme } = useColorScheme();

    useEffect(() => {
        // Load saved theme on mount
        AsyncStorage.getItem('theme').then((theme) => {
            if (theme === 'dark' || theme === 'light') {
                setColorScheme(theme);
            }
        });
    }, []);

    useEffect(() => {
        // Save theme whenever it changes
        if (colorScheme) {
            AsyncStorage.setItem('theme', colorScheme);
        }
    }, [colorScheme]);
}
