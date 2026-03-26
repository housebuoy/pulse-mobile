import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DividerProps {
  // Layout
  orientation?: 'horizontal' | 'vertical';
  // Optional label — only works with horizontal
  label?: string;
  // Appearance
  color?: string;
  thickness?: number;
  // Horizontal-specific
  marginVertical?: number;
  // Vertical-specific
  height?: number;
}

export default function Divider({
  orientation = 'horizontal',
  label,
  color = '#F3F4F6',
  thickness = 1,
  marginVertical = 24,
  height = 40,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <View
        style={{
          width: thickness,
          height,
          backgroundColor: color,
        }}
      />
    );
  }

  // Horizontal with no label
  if (!label) {
    return (
      <View
        style={{
          height: thickness,
          backgroundColor: color,
          marginVertical,
        }}
      />
    );
  }

  // Horizontal with label
  return (
    <View style={[styles.labelRow, { marginVertical }]}>
      <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
      <Text style={styles.labelText}>{label}</Text>
      <View style={[styles.line, { backgroundColor: color, height: thickness }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});