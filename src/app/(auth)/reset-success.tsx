import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

export default function ResetSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-8">
        <View
          className="mb-6 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.primaryLight }}>
          <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} />
        </View>
        <Text className="mb-2 text-center text-4xl font-extrabold text-gray-900">
          Password Reset
        </Text>
        <Text className="text-center text-base text-gray-500">
          Your password has been reset successfully. You can now sign in with your new password.
        </Text>
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity
          className="items-center rounded-2xl py-4 shadow-lg shadow-blue-500/40"
          style={{ backgroundColor: COLORS.primary }}
          onPress={() => router.replace('/(auth)/login')}>
          <Text className="text-lg font-bold text-white">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
