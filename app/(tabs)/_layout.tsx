import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#111' : '#fff',
          borderTopColor: isDark ? '#333' : '#f3f4f6',
          height: 85,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: isDark ? '#666' : '#9ca3af',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              size={28}
              name="home"
              color={color}
              style={{ opacity: focused ? 1 : 0.8 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          title: 'Invitations',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="mail"
              size={28}
              color={color}
              style={{ opacity: focused ? 1 : 0.8 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
