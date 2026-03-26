import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import '../../global.css';
import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons'; // For the temporary logo icon

export default function SplashScreen() {
  const router = useRouter();
  // 1. Initialize animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // 2. Fade the entire screen in smoothly
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 3. Create the continuous "Pulse" heartbeat effect for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05, // Grow slightly
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95, // Shrink slightly
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const splashTimeout = setTimeout(() => {
      router.replace('/login'); // Navigate to the login screen after 3 seconds
    }, 3000);
    return () => clearTimeout(splashTimeout);
  }, [fadeAnim, scaleAnim, router]);

  return (
    <LinearGradient
      // Your exact Deep Blue to Vibrant Teal gradient
      colors={['#0061FF', '#33E1FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      // Standard inline style to ensure it fills the screen completely
      style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
      {/* Wrap content in Animated.View to apply the fade and heartbeat scale */}
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="w-full">
        {/* The White Logo Shape */}
        <View className="mb-4 flex-row items-center justify-center">
          {/* Temporary shape matching your logo until you drop the exact SVG in */}
          {/* <View className="w-24 h-24 bg-white rounded-full mr-2 shadow-sm" /> */}
          {/* <Ionicons name="play" size={64} color="white" className="shadow-sm" /> */}
          <Image
            source={require('../../assets/icons/splash-icon-light.png')}
            style={{ width: 200, height: 96 }}
          />
        </View>

        {/* Brand Name */}
        <Text className="text-5xl font-extrabold tracking-widest text-white drop-shadow-md">
          Pulse
        </Text>
      </Animated.View>

      {/* Tagline pinned to the bottom */}
      <Animated.View style={{ opacity: fadeAnim }} className="absolute bottom-12 items-center">
        <Text className="text-lg font-medium tracking-wide text-white/90">
          Skip the waiting room.
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}
