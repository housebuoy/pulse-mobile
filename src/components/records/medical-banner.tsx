import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { COLORS } from '@/constants/theme';

export default function MedicalIdBanner({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <AntDesign name="idcard" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>My Medical ID</Text>
        <Text style={styles.subtitle}>Vitals, allergies & blood group</Text>
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