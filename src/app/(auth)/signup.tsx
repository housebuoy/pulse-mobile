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
import { useRouter} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleIcon } from '@/components/ui/google-icon';

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6">
        {/* --- TOP NAVIGATION ---
        <View className="w-full mt-4 mb-2">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="p-2 -ml-2 w-12"
          >
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View> */}

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled" // Lets users tap buttons without dismissing keyboard first
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 justify-center">
            {/* --- BRANDING HEADER --- */}
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

              <Text className="mb-1 text-3xl font-extrabold text-gray-900">Create Account.</Text>

              <Text className="text-base font-normal text-gray-500">
                Join to skip the waiting room.
              </Text>
            </View>

            {/* --- INPUT FIELDS (Frictionless) --- */}
            <View className="mb-4 gap-y-2">
              {/* Phone Number Input */}
              <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 focus:border-[#2563EB]">
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Phone Number"
                  textContentType="username"
                  autoComplete="username"
                  placeholderTextColor="#9CA3AF"
                  className="ml-3 flex-1 text-base text-gray-900"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password Input */}
              <View className="mb-4 gap-2">
                {/* --- Create Password --- */}
                <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 focus:border-[#2563EB]">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="Create Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    className="ml-3 flex-1 text-base text-gray-900"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {/* --- Confirm Password --- */}
                <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 focus:border-[#2563EB]">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  <TextInput
                    placeholder="Confirm Password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    secureTextEntry={!showConfirmPassword}
                    className="ml-3 flex-1 text-base text-gray-900"
                  />
                  {/* USE THE NEW STATE TOGGLE HERE: */}
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1">
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* --- TERMS & PRIVACY --- */}
            <View className="mb-6 px-2">
              <Text className="text-center text-sm leading-5 text-gray-500">
                By signing up, you agree to our{' '}
                <Text className="font-semibold text-primary">Terms of Service</Text> and{' '}
                <Text className="font-semibold text-primary">Privacy Policy</Text>.
              </Text>
            </View>

            {/* --- MAIN SIGN UP BUTTON (Routes to OTP) --- */}
            <TouchableOpacity
              className="mb-8 items-center rounded-2xl bg-primary py-4 shadow-lg shadow-blue-500/40"
              onPress={() => router.push('/(auth)/otp')}>
              <Text className="text-lg font-bold text-white">Sign Up</Text>
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

          {/* --- SIGN IN LINK --- */}
          <View className="mt-auto flex-row justify-center pb-8">
            <Text className="font-medium text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="font-bold text-primary">Sign In.</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
