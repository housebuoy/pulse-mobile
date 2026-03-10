import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  return (
    <LinearGradient
      // Your premium Deep Blue to Vibrant Teal gradient
      colors={['#0061FF', '#33E1FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
    >
      <View className="flex-1 justify-center items-center">
        {/* Logo Placeholder - You will swap this View for an <Image> later */}
        <View className="w-24 h-24 bg-white/20 rounded-3xl mb-4 items-center justify-center">
          <Text className="text-white font-bold text-2xl">Icon</Text>
        </View>

        {/* Brand Name */}
        <Text className="text-white text-5xl font-extrabold tracking-widest">
          PULSE
        </Text>
      </View>

      {/* Tagline pinned to the bottom */}
      <View className="absolute bottom-12">
        <Text className="text-white/80 text-lg font-medium tracking-wide">
          Skip the waiting room.
        </Text>
      </View>
    </LinearGradient>
  );
}