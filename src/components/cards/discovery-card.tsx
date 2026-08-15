import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface DiscoveryCardProps {
  onBook: () => void;
}

export default function DiscoveryCard({ onBook }: DiscoveryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>No active visits today</Text>
      <Text style={styles.subtitle}>
        Need to see a doctor? Find a hospital or book an appointment.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onBook}>
        <Text style={styles.buttonText}>Find Care</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EFF6FF', // Soft blue-50 tint
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE', // blue-100
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#DBEAFE',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textMain, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSub, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    width: '100%',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});