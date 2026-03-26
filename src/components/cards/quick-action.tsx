import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  backgroundColor: string;
  iconColor: string;
  onPress: () => void;
}

export default function QuickActionIcon({ iconName, label, backgroundColor, iconColor, onPress }: QuickActionIconProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72, // Fixed width ensures they space out evenly
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
});