import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastVariant = 'info' | 'warning' | 'error' | 'success' | 'tip';

interface ToastBannerProps {
  variant?: ToastVariant;
  message: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  floating?: boolean; 
  duration?: number;
}

const VARIANT_CONFIG: Record<ToastVariant, any> = {
  info: { icon: 'information-circle', iconColor: '#2563EB', titleColor: '#1D4ED8', textColor: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', defaultTitle: 'Info' },
  warning: { icon: 'warning', iconColor: '#CA8A04', titleColor: '#92400E', textColor: '#78350F', bg: '#FFFBEB', border: '#FDE68A', defaultTitle: 'Notice' },
  error: { icon: 'close-circle', iconColor: '#DC2626', titleColor: '#991B1B', textColor: '#7F1D1D', bg: '#FEF2F2', border: '#FECACA', defaultTitle: 'Alert' },
  success: { icon: 'checkmark-circle', iconColor: '#059669', titleColor: '#065F46', textColor: '#064E3B', bg: '#ECFDF5', border: '#A7F3D0', defaultTitle: 'Success' },
  tip: { icon: 'bulb', iconColor: '#7C3AED', titleColor: '#5B21B6', textColor: '#4C1D95', bg: '#F5F3FF', border: '#DDD6FE', defaultTitle: 'Tip' },
};

export function ToastBanner({
  variant = 'info',
  message,
  title,
  dismissible = true,
  onDismiss,
  floating = false,
  duration = 5000,
}: ToastBannerProps) {
  const [visible, setVisible] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const translateY = useRef(new Animated.Value(floating ? -100 : 0)).current;
  const opacity = useRef(new Animated.Value(floating ? 0 : 1)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (floating && visible && !isAnimatingOut) {
      // Animate in
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();

      // Auto-dismiss logic
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, floating, isAnimatingOut, duration]);

  const handleDismiss = () => {
    if (floating) {
      setIsAnimatingOut(true);
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    } else {
      setVisible(false);
      onDismiss?.();
    }
  };

  // ✅ FIXED: Only return null when truly not visible
  if (!visible) return null;

  const config = VARIANT_CONFIG[variant];
  const displayTitle = title ?? config.defaultTitle;

  return (
    <Animated.View style={[
      styles.container,
      { backgroundColor: config.bg, borderColor: config.border },
      floating && styles.floatingContainer,
      floating && { transform: [{ translateY }], opacity, top: insets.top + -17 }
    ]}>
      <Ionicons name={config.icon} size={20} color={config.iconColor} style={styles.icon} />
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: config.titleColor }]}>{displayTitle}</Text>
        <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
      </View>
      {dismissible && (
        <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={config.iconColor} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: 12, padding: 12, gap: 10, marginBottom: 5 },
  floatingContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 0,
  },
  icon: { marginTop: 1 },
  textBlock: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  message: { fontSize: 13, lineHeight: 18 },
  closeBtn: { marginTop: 1, padding: 2 },
});