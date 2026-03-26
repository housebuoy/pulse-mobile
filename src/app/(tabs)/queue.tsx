import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useRouter } from 'expo-router';

// Import your awesome unified component
import LiveQueueCard from '../../components/cards/live-queue-card';
import InstructionList from '../../components/queue/instruction-list';
import IconButton from '@/components/ui/header-badge';
import SectionHeader from '@/components/shared/section-header';

export default function QueueScreen() {
  
  const router = useRouter();

  const queueRules = [
    { id: '1', text: <Text>Please ensure you are within the hospital premises at least <Text style={styles.boldText}>15 minutes</Text> before your turn.</Text> },
    { id: '2', text: <Text>If you miss your call, you will be shifted back <Text style={styles.boldText}>3 spaces</Text> in the queue automatically.</Text> },
    { id: '3', text: <Text>Keep your ticket QR code ready for scanning at the reception desk.</Text> },
  ];

  // Placeholder actions
  const handleArrived = () => Alert.alert("Location Verified", "You are now marked as present in the waiting room.");
  const handleCancel = () => Alert.alert("Cancel Ticket", "Are you sure you want to cancel your queue ticket?", [{text: "No"}, {text: "Yes, Cancel", style: "destructive"}]);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* --- CUSTOM HEADER --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Live Queue</Text>
          <View style={styles.statusRow}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>Last updated: Just now</Text>
          </View>
        </View>
        
        <IconButton
          icon="notifications-outline"
          badge={true}
          // onPress={() => router.push('/notifications')}
        />
      </View>

      {/* --- MAIN CONTENT --- */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. YOUR UNIFIED QUEUE CARD (Queue Variant) */}
        <LiveQueueCard 
          variant="queue"
          hospitalName="KNUST University Hospital"
          department="General OPD"
          doctorName="Dr. Arhin"
          currentNumber={4}
          userNumber={12}
          waitTimeMins={45}
          roomNumber="302"
          onArrived={handleArrived}
          onCancel={handleCancel}
          onQRPress={() => Alert.alert("QR Code", "Displaying full screen QR...")}
        />

        {/* 2. RELATED FUNCTIONS (Reschedule, Directions, etc.) */}
        <SectionHeader title="Manage Appointment" iconName="options-outline" />
        <View style={styles.relatedFunctionsRow}>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(screens)/reschedule')} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>Reschedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="map-outline" size={22} color="#9333EA" />
            </View>
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFEFF' }]}>
              <Ionicons name="call-outline" size={22} color="#0891B2" />
            </View>
            <Text style={styles.actionText}>Desk</Text>
          </TouchableOpacity>

        </View>

        {/* 3. IMPORTANT INSTRUCTIONS */}
        <View style={styles.instructionsWrapper}>
           <InstructionList rules={queueRules} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Off-white to make the card pop
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // Emerald green
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  
  // --- RELATED FUNCTIONS STYLES ---
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    marginTop: 4,
  },
  relatedFunctionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  
  // --- INSTRUCTIONS ---
  instructionsWrapper: {
    marginTop: 8,
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  }
});