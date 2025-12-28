import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CreateListModal from '../../components/CreateListModal';

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="flex-1 bg-background-light">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="px-5 pt-14 pb-4 flex-row justify-between items-center bg-background-light/95 backdrop-blur-md z-20">
        <View className="flex-col">
          <Text className="text-sm font-medium text-gray-500 tracking-wider uppercase">Today, Oct 24</Text>
          <Text className="text-2xl font-bold text-gray-900 mt-0.5">Good Morning, Alex</Text>
        </View>
        <View className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <Image
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAby3pqvqhZkgfnDslbkkG15A6AOQ2DKjRSxSlHGbzK6xcaj69t69RHSXSScFQZWkVkcQUmr9yhsAufgQoSG7mSlKW73eU8oo7ARGSRnjSgF9jwlPBkCCqTIH2k9uSw9la3y3wxDDlXPWfspSIAm--PJokxDrwJdoN1juy1V2wxsxVV1SIWUFFDE-6fL6gqHHVbYx9XEstb0VjuVbeM6RJyMsYBmxhOLIORRLlt4Uh1EM4kBp5Slsb2GGtjA3258hDXWYyohy2AuXg" }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Search */}
      <View className="px-5 mb-6">
        <View className="relative">
          <View className="absolute inset-y-0 left-0 flex-row items-center pl-3 z-10">
            <MaterialIcons name="search" size={24} color="#9ca3af" />
          </View>
          <TextInput
            className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm border border-gray-200"
            placeholder="Search lists..."
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 100, gap: 32 }}>
        {/* Standard Lists */}
        <View className="flex-col gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900">Standard Lists</Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-3">
            <ListItem icon="shopping-cart" color="#16a34a" bg="#dcfce7" title="Grocery Shopping" />
            <ListItem icon="luggage" color="#ea580c" bg="#ffedd5" title="Vacation Packing" />
            <ListItem icon="fitness-center" color="#dc2626" bg="#fee2e2" title="Gym Routine" />
          </View>
        </View>

        {/* Advanced Lists */}
        <View className="flex-col gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900">Advanced Lists</Text>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-primary">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-col gap-3">
            <ListItem icon="home-repair-service" color="#2563eb" bg="#dbeafe" title="House Remodeling" />
            <ListItem icon="work" color="#9333ea" bg="#f3e8ff" title="Work Tasks" />
            <ListItem icon="directions-car" color="#4b5563" bg="#f3f4f6" title="Vehicle Maintenance" />
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

      {/* Background Gradient overlay - simplified as a View or ignored if complex */}
      <View pointerEvents="none" className="absolute bottom-0 left-0 right-0 h-20 bg-transparent" />

      <CreateListModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

function ListItem({ icon, color, bg, title }: { icon: any, color: string, bg: string, title: string }) {
  return (
    <TouchableOpacity className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center gap-4">
        <View className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
          <MaterialIcons name={icon} size={20} color={color} />
        </View>
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );
}
