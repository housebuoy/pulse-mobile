import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EmergencyBanner() {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      // This now routes directly to the Smart Triage screen!
      onPress={() => router.push('/emergency-triage')}>
      <View style={styles.bannerContainer}>
        <View style={styles.headerRow}>
          <Ionicons name="warning" size={20} color="#DC2626" />
          <Text style={styles.headerText}>MEDICAL EMERGENCY?</Text>
        </View>

        <Text style={styles.bodyText}>Skip the queue and get immediate attention</Text>
        <View style={{ width: '90%', display: 'flex', flexDirection: 'row', alignItems: 'center' }} className='gap-1'>
          <Text style={styles.actionText}>
            Start Priority Triage
          </Text> 
          <Ionicons name="arrow-forward" size={16} color="#DC2626" className="" />
        </View>
        <Ionicons name="medical" size={100} color="rgba(220, 38, 38, 0.05)" style={styles.bgIcon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 10,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
    marginLeft: 8,
  },
  bodyText: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    width: '90%',
  },
  actionText: {
    color: '#DC2626', // Made red to stand out as a clickable link
    fontWeight: '600',
    fontSize: 15,
  },
  bgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    transform: [{ rotate: '15deg' }],
  },
});
