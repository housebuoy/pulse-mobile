import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { COLORS } from '@/constants/theme';
import { useMedicalStore } from '@/stores/medical-store';

// Reads straight from the same medical-store the Medical ID & Vitals screen
// writes to — one data source, this banner is just a live-updating preview
// of it, not a second copy.
export default function MedicalIdBanner({ onPress }: { onPress?: () => void }) {
  const bloodGroup = useMedicalStore((state) => state.bloodGroup);
  const allergies = useMedicalStore((state) => state.allergies);

  const subtitle = (() => {
    const parts: string[] = [];
    parts.push(bloodGroup ? `Blood group ${bloodGroup}` : 'Blood group not set');
    parts.push(
      allergies.length ? `${allergies.length} ${allergies.length === 1 ? 'allergy' : 'allergies'} noted` : 'No allergies noted'
    );
    return parts.join(' · ');
  })();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <AntDesign name="idcard" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>My Medical ID</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF', // Very light blue
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 24, // Pill shape
    padding: 12,
    paddingRight: 16,
    marginBottom: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  }
});