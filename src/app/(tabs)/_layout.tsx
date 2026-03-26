import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

// --- CUSTOM FLOATING ACTION BUTTON ---
// This pushes the center button UP and out of the standard tab bar
const CustomTabBarButton = ({ onPress }: any) => (
  <TouchableOpacity
    style={styles.customButtonWrapper}
    onPress={onPress}
    activeOpacity={0.85}>
    <View style={styles.customButton}>
      <Ionicons name="add" size={32} color="#fff" />
    </View>
  </TouchableOpacity>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }}
      />
      
      {/* --- THE MIDDLE FLOATING BUTTON --- */}
      {/* We name it 'action' but it could be a modal to 'Book Visit' */}
      <Tabs.Screen
        name="book-appointment"
        options={{
          title: '', // No text under the + button
          tabBarIcon: () => <Ionicons name="add" size={32} color="#ffffff" />,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="records"
        options={{
          title: 'Records',
          tabBarIcon: ({ color }) => <Ionicons name="folder-open" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customButtonWrapper: {
    top: -20, // Pushes the button above the tab bar
    justifyContent: 'center',
    alignItems: 'center',
  },
  customButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: COLORS.primary, // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    marginTop: 10, 
  }
});