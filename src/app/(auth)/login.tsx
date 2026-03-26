import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleIcon } from '@/components/ui/google-icon';
import { COLORS } from '@/constants/theme';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled" // Lets users tap buttons without dismissing keyboard first
          showsVerticalScrollIndicator={false}>
          {/* --- BRANDING HEADER --- */}
          <View className="flex-1 justify-center">
            <View className="mb-10 mt-8 items-center">
              {/* Logo Circle - You can also replace this whole View with your splash icon Image if you prefer */}
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md shadow-blue-500/30">
                <Image
                  source={require('../../../assets/icons/splash-icon-light.png')}
                  style={{ width: 60, height: 50 }}
                />
              </View>

              <Text className="mb-2 text-xl font-extrabold uppercase tracking-widest text-primary">
                PULSE
              </Text>

              <Text className="mb-1 text-3xl font-extrabold text-gray-900">Welcome Back.</Text>

              <Text className="text-base font-normal text-gray-500">
                Sign in to skip the waiting room.
              </Text>
            </View>

            {/* --- INPUT FIELDS --- */}
            <View className="mb-2 gap-2">
              {/* Phone / Ghana Card Input */}
              <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Phone Number or Ghana Card ID"
                  placeholderTextColor="#9CA3AF"
                  className="ml-3 flex-1 text-base text-gray-900"
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input */}
              <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  className="ml-3 flex-1 text-base text-gray-900"
                />
                {/* The Eye Toggle */}
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* --- FORGOT PASSWORD --- */}
            <View className="mb-8 mt-2 items-end">
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-primary">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* --- MAIN SIGN IN BUTTON --- */}
            <TouchableOpacity
              className="mb-8 items-center rounded-2xl py-4 shadow-lg shadow-blue-500/40"
              style={{ backgroundColor: COLORS.primary }}
              onPress={() => router.replace('/(tabs)/home')}>
              <Text className="text-lg font-bold text-white">Sign In</Text>
            </TouchableOpacity>

            {/* --- DIVIDER --- */}
            <View className="mb-8 flex-row items-center">
              <View className="h-[1px] flex-1 bg-gray-200" />
              <Text className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Or continue with
              </Text>
              <View className="h-[1px] flex-1 bg-gray-200" />
            </View>

            {/* --- SOCIAL BUTTONS --- */}
            <View className="mb-8 flex-row justify-between gap-4 space-x-4">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 bg-white py-3.5">
                {/* Replace the source here with wherever you saved that Google 'G' image! */}
                <GoogleIcon size={20} />
                <Text className="ml-2 font-semibold text-gray-900">Google</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 bg-white py-3.5">
                <Ionicons name="logo-apple" size={20} color="#111827" />
                <Text className="ml-2 font-semibold text-gray-900">Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* --- SIGN UP LINK --- */}
          <View className="mt-auto flex-row justify-center pb-8">
            <Text className="font-medium text-gray-500">Don&apos;t have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="font-bold text-primary">Sign Up.</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
