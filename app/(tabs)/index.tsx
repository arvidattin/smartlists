import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import CreateListModal from '../../components/CreateListModal';
import ProfileModal from '../../components/ProfileModal';
import { useLists } from "../../hooks/useLists";
import { supabase } from '../../lib/supabase';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [foundTasks, setFoundTasks] = useState<any[]>([]);
  const { lists, loading, refetch } = useLists();

  useEffect(() => {
    if (searchQuery.length < 2) {
      setFoundTasks([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, list:lists(title, type, icon_name, icon_color)')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);
      setFoundTasks(data || []);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
    AsyncStorage.getItem('search_history').then((h: string | null) => {
      if (h) setHistory(JSON.parse(h));
    });
  }, []);

  const addToHistory = async (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query.trim(), ...history.filter(h => h !== query.trim())].slice(0, 5);
    setHistory(newHistory);
    await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const removeFromHistory = async (query: string) => {
    const newHistory = history.filter(h => h !== query);
    setHistory(newHistory);
    await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
  };

  const filteredLists = lists.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const standardLists = filteredLists.filter(l => l.type === 'standard');
  const advancedLists = filteredLists.filter(l => l.type === 'advanced');

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="px-5 py-4 flex-row justify-between items-center">
        <View className="flex-col">
          <Text className="text-sm font-medium text-gray-500 uppercase tracking-wider">Today, Oct 14</Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">Hello, {userEmail ? userEmail.split('@')[0] : 'Friend'}</Text>
        </View>

        {/* Profile Button */}
        <TouchableOpacity
          onPress={() => setProfileVisible(true)}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary shadow-sm"
        >
          <Text className="text-white font-bold text-lg">
            {userEmail ? userEmail[0].toUpperCase() : 'U'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 mb-6 z-50 relative">
        <View className="flex-row items-center bg-white dark:bg-surface-dark rounded-2xl h-12 px-4 shadow-sm border border-gray-100 dark:border-gray-800">
          <MaterialIcons name="search" size={24} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="Search lists..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            onSubmitEditing={() => addToHistory(searchQuery)}
          />
        </View>

        {showHistory && history.length > 0 && (
          <View className="absolute top-14 left-5 right-5 bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden">
            {history.map((item, i) => (
              <TouchableOpacity
                key={i}
                className="flex-row items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-white/5"
                onPress={() => {
                  setSearchQuery(item);
                  addToHistory(item);
                  setShowHistory(false);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="history" size={20} color="#9ca3af" />
                  <Text className="text-gray-700 dark:text-gray-300">{item}</Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item);
                  }}
                  className="p-1"
                >
                  <MaterialIcons name="close" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        {/* Found Items */}
        {foundTasks.length > 0 && (
          <View className="flex-col gap-3 mb-8">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Found Items</Text>
            <View className="flex-col gap-3">
              {foundTasks.map(task => (
                <Link
                  key={task.id}
                  href={{
                    pathname: '/list/[id]',
                    params: { id: task.list_id, type: task.list?.type || 'standard', title: task.list?.title || 'List' }
                  }}
                  asChild
                >
                  <TouchableOpacity className="flex-row items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-transparent shadow-sm">
                    <MaterialIcons name={task.status ? "check-circle" : "radio-button-unchecked"} size={24} color={task.status ? "#16a34a" : "#9ca3af"} />
                    <View className="ml-3 flex-1">
                      <Text className={`text-base font-medium ${task.status ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{task.title}</Text>
                      <Text className="text-xs text-gray-400">In {task.list?.title || 'Unknown List'}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Standard Lists */}
        <View className="flex-col gap-3 mb-8">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Standard Lists</Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-3">
            {standardLists.map(list => (
              <ListItem
                key={list.id}
                id={list.id}
                icon={list.icon_name || 'list'}
                color={list.icon_color || '#16a34a'}
                bg={list.icon_color ? `${list.icon_color}20` : '#dcfce7'} // Hex alpha approximation
                title={list.title}
                type="standard"
              />
            ))}
            {!loading && standardLists.length === 0 && <Text className="text-gray-400">No standard lists yet.</Text>}
          </View>
        </View>

        {/* Advanced Lists */}
        <View className="flex-col gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Advanced Lists</Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-3">
            {advancedLists.map(list => (
              <ListItem
                key={list.id}
                id={list.id}
                icon={list.icon_name || 'work'}
                color={list.icon_color || '#9333ea'}
                bg={list.icon_color ? `${list.icon_color}20` : '#f3e8ff'}
                title={list.title}
                type="advanced"
              />
            ))}
            {!loading && advancedLists.length === 0 && <Text className="text-gray-400">No advanced lists yet.</Text>}
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/40"
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      <CreateListModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        userEmail={userEmail}
      />
    </SafeAreaView>
  );
}

function ListItem({ icon, color, bg, title, type, id }: { icon: any, color: string, bg: string, title: string, type: 'standard' | 'advanced', id: string }) {
  return (
    <Link href={{ pathname: "/list/[id]", params: { id: id, type, title } }} asChild>
      <TouchableOpacity className="flex-row items-center justify-between rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center gap-4">
          <View className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
            <MaterialIcons name={icon} size={20} color={color} />
          </View>
          <Text className="text-base font-semibold text-gray-900 dark:text-white">{title}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
      </TouchableOpacity>
    </Link>
  );
}
