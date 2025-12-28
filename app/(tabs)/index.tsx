import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Placeholder data since we ignore tables for now
  const [items, setItems] = useState([
    { id: '1', title: 'Groceries', count: 5 },
    { id: '2', title: 'Work Tasks', count: 12 },
    { id: '3', title: 'Ideas', count: 3 },
  ]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/sign-in');
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4 bg-white border-b border-gray-200 flex-row justify-between items-center mt-10">
        <Text className="text-2xl font-bold text-gray-900">My Lists</Text>
        <TouchableOpacity onPress={signOut} className="bg-gray-200 p-2 rounded-lg">
          <Text className="text-gray-700 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="bg-white p-4 mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-semibold text-gray-800">{item.title}</Text>
              <Text className="text-gray-500">{item.count} items</Text>
            </View>
            <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center">
              <Text className="text-blue-600 font-bold">></Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg">
        <Text className="text-white text-3xl pb-1">+</Text>
      </TouchableOpacity>
    </View>
  );
}
