import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface SettingsRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  rightLabel?: string;
  rightLabelColor?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isLast?: boolean; // Hides the divider line on the last item in a card
  isDestructive?: boolean; // For the Log Out button
  onPress?: () => void;
}

export default function SettingsRow({
  iconName, iconBgColor, iconColor, title, subtitle, rightLabel, rightLabelColor = '#6B7280',
  isSwitch, switchValue, onSwitchChange, isLast, isDestructive, onPress
}: SettingsRowProps) {
  return (
    <TouchableOpacity 
      style={[styles.rowContainer, !isLast && styles.bottomBorder]} 
      onPress={onPress}
      disabled={isSwitch} 
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
        <Ionicons name={iconName} size={20} color={isDestructive ? '#DC2626' : iconColor} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, isDestructive && styles.destructiveText]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.rightContent}>
        {rightLabel && (
          <Text style={[styles.rightLabel, { color: rightLabelColor }]}>{rightLabel}</Text>
        )}
        
        {isSwitch ? (
          <Switch 
            value={switchValue} 
            onValueChange={onSwitchChange}
            trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
            thumbColor={COLORS.primary}
          />
        ) : (
          !isDestructive && <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Subtle native divider
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  destructiveText: {
    color: '#DC2626',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightLabel: {
    fontSize: 14,
    fontWeight: '500',
  }
});