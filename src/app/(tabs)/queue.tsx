import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useRouter } from 'expo-router';

import LiveQueueCard from '../../components/cards/live-queue-card';
import InstructionList from '../../components/queue/instruction-list';
import IconButton from '@/components/ui/header-badge';
import SectionHeader from '@/components/shared/section-header';
import { useQueueStore } from '@/stores/queue-store';

export default function QueueScreen() {
  const router = useRouter();
  const ticket = useQueueStore((state) => state.ticket);

  // Check if we actually have an active queue ticket
  const hasActiveQueue = ticket && ticket.hospitalName;

  const queueRules = [
    {
      id: '1',
      text: (
        <Text style={styles.ruleText}>
          Please ensure you are within the hospital premises at least{' '}
          <Text style={styles.boldText}>15 minutes</Text> before your turn.
        </Text>
      ),
    },
    {
      id: '2',
      text: (
        <Text style={styles.ruleText}>
          If you miss your call, you will be shifted back{' '}
          <Text style={styles.boldText}>3 spaces</Text> in the queue automatically.
        </Text>
      ),
    },
    {
      id: '3',
      text: <Text style={styles.ruleText}>Keep your ticket QR code ready for scanning at the reception desk.</Text>,
    },
  ];

  // Placeholder actions
  const handleArrived = () =>
    Alert.alert('Location Verified', 'You are now marked as present in the waiting room.');
  const handleCancel = () =>
    Alert.alert('Cancel Ticket', 'Are you sure you want to cancel your queue ticket?', [
      { text: 'No' },
      { text: 'Yes, Cancel', style: 'destructive' },
    ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- CUSTOM HEADER --- */}
      <View style={styles.header}>
        <View>
          {/* Header text slightly reduced and tracked for better mobile UX */}
          <Text style={styles.headerTitle}>Live Queue</Text>
          {hasActiveQueue && (
            <View style={styles.statusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.statusText}>Last updated: Just now</Text>
            </View>
          )}
        </View>

        <IconButton
          icon="notifications-outline"
          badge={true}
        />
      </View>

      {/* --- CONDITIONAL MAIN CONTENT --- */}
      {hasActiveQueue ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 1. THE QUEUE CARD */}
          <LiveQueueCard
            variant="queue"
            hospitalName={ticket.hospitalName}
            department={ticket.department}
            doctorName={ticket.doctorName}
            currentNumber={ticket.currentNumber}
            userNumber={ticket.userNumber}
            waitTimeMins={ticket.waitTimeMins}
            roomNumber={ticket.roomNumber}
            onArrived={handleArrived}
            onCancel={handleCancel}
            onQRPress={() => Alert.alert('QR Code', 'Displaying full screen QR...')}
          />

          {/* 2. MANAGE APPOINTMENT (Now using Horizontal Pills) */}
          <View style={styles.sectionSpacing}>
            <SectionHeader title="Manage Appointment" iconName="options-outline" />
            <View style={styles.pillContainer}>
              <TouchableOpacity
                style={styles.actionPill}
                onPress={() => router.push('/(screens)/reschedule')}
                activeOpacity={0.7}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.actionPillText}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionPill} activeOpacity={0.7}>
                <Ionicons name="map-outline" size={16} color={COLORS.primary} />
                <Text style={styles.actionPillText}>Directions</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionPill} activeOpacity={0.7}>
                <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                <Text style={styles.actionPillText}>Desk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionPill} activeOpacity={0.7}>
                <Ionicons name="information" size={16} color={COLORS.primary} />
                <Text style={styles.actionPillText}>View more info</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. IMPORTANT INSTRUCTIONS (Timeline UI) */}
          <View style={styles.instructionsWrapper}>
            {/* <Text style={styles.sectionTitle}>Important Information</Text> */}
            <InstructionList rules={queueRules} />
          </View>
        </ScrollView>
      ) : (
        /* --- EMPTY STATE --- */
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="time-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>You&apos;re not in any queues</Text>
          <Text style={styles.emptySubtitle}>
            When you check in at the hospital, your live queue status will appear here.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28, // Scaled down for mobile standards
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', 
  },
  statusText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  sectionSpacing: {
    marginBottom: 32,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },

  // --- ACTION PILLS ---
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // --- INSTRUCTIONS ---
  instructionsWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  ruleText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  },

  // --- EMPTY STATE ---
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80, // Offset for bottom tab
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});