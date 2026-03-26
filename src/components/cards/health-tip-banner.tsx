import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HealthTipBannerProps {
  category: string;
  title: string;
  onPress?: () => void;
}

export default function HealthTipBanner({ category, title, onPress }: HealthTipBannerProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      {/* Note: When you have the actual image, change this View to an ImageBackground 
        and pass source={require('../../assets/wave-bg.png')}
      */}
      <View style={styles.bannerContainer}>
        <Text style={styles.categoryText}>{category}</Text>
        <Text style={styles.titleText}>{title}</Text>
        
        {/* A subtle arrow to indicate it's tappable */}
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#0F766E', // A nice deep teal fallback for the Harmattan theme
    borderRadius: 16,
    padding: 30,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 120,
    justifyContent: 'center',
  },
  categoryText: {
    color: '#34D399', // Bright mint green
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    width: '85%', // Leaves room for the arrow
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 999,
  }
});