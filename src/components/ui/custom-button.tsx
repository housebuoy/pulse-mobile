import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { COLORS } from '@/constants/theme'; // Ensure this points to your theme file

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;       // For passing custom margins/widths
  textStyle?: TextStyle;   // For passing custom font sizes
  icon?: React.ReactNode;  // For passing an Ionicons component
}

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  style,
  textStyle,
  icon,
}: CustomButtonProps) {
  
  // Dynamic background color based on variant and disabled state
  const getBackgroundColor = () => {
    if (disabled) return '#E5E7EB'; // Light grey when disabled
    switch (variant) {
      case 'primary': return COLORS.primary; // #2a79e9
      case 'secondary': return '#EFF6FF'; // Very light blue
      case 'danger': return COLORS.danger; // #DC2626
      case 'outline': return 'transparent';
      default: return COLORS.primary;
    }
  };

  // Dynamic text color based on variant and disabled state
  const getTextColor = () => {
    if (disabled) return '#9CA3AF'; // Darker grey text when disabled
    switch (variant) {
      case 'primary': return COLORS.white;
      case 'danger': return COLORS.white;
      case 'secondary': return COLORS.primary;
      case 'outline': return COLORS.primary;
      default: return COLORS.white;
    }
  };

  // Dynamic border for the outline variant
  const getBorderStyle = () => {
    if (variant === 'outline') {
      return { borderWidth: 2, borderColor: disabled ? '#E5E7EB' : COLORS.primary };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        style, // Allows overriding from parent
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16, // Matching your Design System
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Defaults to full width
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});