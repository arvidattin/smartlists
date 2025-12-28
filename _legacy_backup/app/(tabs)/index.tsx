import Auth from '@/components/Auth';
import CreateListModal from '@/components/CreateListModal';
import { supabase } from '@/lib/supabase';
import { List } from '@/types';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Session } from '@supabase/supabase-js';

export default function HomeScreen() {
  const router = useRouter();

  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchLists();
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLists();
      else setLists([]);
    });
  }, []);

  useEffect(() => {
    if (!session) return;

    // Subscribe to lists changes
    const subscription = supabase
      .channel('lists_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lists' },
        (payload) => {
          fetchLists();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lists', error);
      } else {
        setLists(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  if (!session) {
    return <Auth />;
  }

  const standardLists = lists.filter(l => l.type === 'standard' && l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const advancedLists = lists.filter(l => l.type === 'advanced' && l.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderListItem = (list: List, icon: keyof typeof MaterialIcons.glyphMap, colorClass: string, iconBgClass: string) => (
    <TouchableOpacity
      key={list.id}
      className="group flex-row w-full items-center justify-between rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-3 active:opacity-70"
      onPress={() => router.push(`/lists/${list.id}`)}
    >
      <View className="flex-row items-center gap-4">
        <View className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClass}`}>
          <MaterialIcons name={icon} size={20} className={colorClass} color={colorClass.includes('green') ? '#16a34a' : '#2563eb'} />
        </View>
        <Text className="text-base font-semibold text-gray-900 dark:text-white font-display">
          {list.name}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLists} />}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-6 bg-background-light/95 dark:bg-background-dark/95">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-col">
              <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider font-display">
                Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 font-display-bold">
                Good Morning, Alex
              </Text>
            </View>
            <View className="h-10 w-10 overflow-hidden rounded-full border-2 border-white dark:border-gray-700 shadow-sm">
              {/* Placeholder image since we can't always load external URLs reliably without config */}
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAby3pqvqhZkgfnDslbkkG15A6AOQ2DKjRSxSlHGbzK6xcaj69t69RHSXSScFQZWkVkcQUmr9yhsAufgQoSG7mSlKW73eU8oo7ARGSRnjSgF9jwlPBkCCqTIH2k9uSw9la3y3wxDDlXPWfspSIAm--PJokxDrwJdoN1juy1V2wxsxVV1SIWUFFDE-6fL6gqHHVbYx9XEstb0VjuVbeM6RJyMsYBmxhOLIORRLlt4Uh1EM4kBp5Slsb2GGtjA3258hDXWYyohy2AuXg' }}
                className="h-full w-full"
              />
            </View>
          </View>

          {/* Search */}
          <View className="relative">
            <View className="absolute inset-y-0 left-0 flex items-center justify-center pl-3 z-10">
              <MaterialIcons name="search" size={20} color="#9ca3af" />
            </View>
            <TextInput
              className="w-full rounded-xl bg-white dark:bg-surface-dark py-3 pl-10 pr-4 text-sm shadow-sm border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-display"
              placeholder="Search lists..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Main Content */}
        <View className="px-5 flex-col gap-8">

          {/* Standard Lists */}
          <View className="flex-col gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900 dark:text-white font-display-bold">Standard Lists</Text>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-primary">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-col">
              {standardLists.map(list => renderListItem(list, 'shopping-cart', 'text-green-600', 'bg-green-50'))}
              {standardLists.length === 0 && (
                <Text className="text-gray-400 italic">No standard lists found</Text>
              )}
            </View>
          </View>

          {/* Advanced Lists */}
          <View className="flex-col gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900 dark:text-white font-display-bold">Advanced Lists</Text>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-primary">View All</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-col">
              {advancedLists.map(list => renderListItem(list, 'home-repair-service', 'text-blue-600', 'bg-blue-50'))}
              {advancedLists.length === 0 && (
                <Text className="text-gray-400 italic">No advanced lists found</Text>
              )}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl shadow-blue-500/40"
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      <CreateListModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onListCreated={fetchLists}
      />
    </SafeAreaView>
  );
}
