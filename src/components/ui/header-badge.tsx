import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  // Icon
  icon: IoniconsName;
  iconSize?: number;
  iconColor?: string;

  // Button appearance
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;

  // Badge — set badge to true for a plain dot, or pass a number to show a count
  badge?: boolean | number;
  badgeColor?: string;
  badgeTextColor?: string;

  // Action
  onPress?: () => void;
  disabled?: boolean;
}

export default function IconButton({
  icon,
  iconSize = 24,
  iconColor = '#111827',
  backgroundColor = '#F3F4F6',
  padding = 12,
  borderRadius = 999,
  badge,
  badgeColor = '#EF4444',
  badgeTextColor = '#fff',
  onPress,
  disabled = false,
}: IconButtonProps) {
  // Badge is visible if badge === true or badge is a number > 0
  const showBadge = badge === true || (typeof badge === 'number' && badge > 0);
  // Cap display count at 99+
  const badgeLabel =
    typeof badge === 'number' ? (badge > 99 ? '99+' : String(badge)) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor, padding, borderRadius },
        disabled && styles.disabled,
      ]}
      activeOpacity={0.7}>

      <Ionicons name={icon} size={iconSize} color={iconColor} />

      {showBadge && (
        <View
          style={[
            styles.badge,
            badgeLabel ? styles.badgeWithCount : styles.badgeDot,
            { backgroundColor: badgeColor, borderColor: backgroundColor },
          ]}>
          {badgeLabel && (
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>
              {badgeLabel}
            </Text>
          )}
        </View>
      )}

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },

  // Plain dot badge
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 1.5,
  },

  // Numbered badge — wider to fit text
  badgeWithCount: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  badge: {},
  badgeText: { fontSize: 9, fontWeight: '800', lineHeight: 11 },
});