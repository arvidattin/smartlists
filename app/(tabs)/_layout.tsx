import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Smartlists',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="list-ul" color={color} />,
        }}
      />
    </Tabs>
  );
}
