import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface SectionHeaderProps {
  title: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({ title, iconName, actionText, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        {iconName && <Ionicons name={iconName} size={20} color={COLORS.primary} style={styles.icon} />}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {actionText && onActionPress && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});