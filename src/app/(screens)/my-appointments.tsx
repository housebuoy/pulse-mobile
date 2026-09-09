import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { getAppointments, PatientAppointment, AppointmentStatus } from '@/lib/api/appointments';

type StatusBadge = { label: string; bg: string; color: string };

const STATUS_BADGES: Record<AppointmentStatus, StatusBadge> = {
  confirmed: { label: 'Approved', bg: '#DCFCE7', color: '#16A34A' },
  cancelled: { label: 'Cancelled', bg: '#F3F4F6', color: '#6B7280' },
  scheduled: { label: 'Pending', bg: '#FEF3C7', color: '#D97706' },
  checked_in: { label: 'Checked In', bg: '#EFF6FF', color: COLORS.primary },
  completed: { label: 'Completed', bg: '#E5E7EB', color: '#374151' },
  no_show: { label: 'No Show', bg: '#F3F4F6', color: '#9CA3AF' },
};

const PAID_BADGE: StatusBadge = { label: 'Paid', bg: '#DCFCE7', color: '#16A34A' };
const PENDING_BADGE: StatusBadge = { label: 'Unpaid', bg: '#FEF3C7', color: '#D97706' };
const FAILED_BADGE: StatusBadge = { label: 'Payment failed', bg: '#FEE2E2', color: '#DC2626' };
const REFUNDED_BADGE: StatusBadge = { label: 'Refunded', bg: '#E5E7EB', color: '#374151' };

// Cancelled/completed/no-show rows are informational history — nothing is owed
// on them, so no payment badge is shown (the status badge still is). The
// backend already excludes them from /outstanding; this is the appointments
// list counterpart so a stale 'pending' never flashes "Unpaid" on them.
const NO_PAYMENT_BADGE_STATUSES: ReadonlySet<AppointmentStatus> = new Set([
  'cancelled',
  'completed',
  'no_show',
]);

function paymentBadge(status: PatientAppointment['paymentStatus']): StatusBadge {
  switch (status) {
    case 'paid':
      return PAID_BADGE;
    case 'failed':
      return FAILED_BADGE;
    case 'refunded':
      return REFUNDED_BADGE;
    default:
      return PENDING_BADGE;
  }
}

function Badge({ badge }: { badge: StatusBadge }) {
  return (
    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
    </View>
  );
}

export default function MyAppointmentsScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      const rows = await getAppointments();
      // Newest first by scheduled date.
      rows.sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1));
      setAppointments(rows);
    } catch {
      /* keep whatever we already have; 401 already routes to login */
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch on every focus (same pattern as payments.tsx) — returning from
  // elsewhere must surface new/cancelled bookings without a manual refresh.
  useFocusEffect(
    useCallback(() => {
      void loadAppointments();
    }, [loadAppointments])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  }, [loadAppointments]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={styles.backButton} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : appointments.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptySubtitle}>
            Book your first visit and it will show up here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }>
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function AppointmentCard({ appointment }: { appointment: PatientAppointment }) {
  const status = STATUS_BADGES[appointment.status] ?? {
    label: appointment.status,
    bg: '#F3F4F6',
    color: '#6B7280',
  };
  let dateLabel = '';
  let timeLabel = '';
  try {
    const when = new Date(appointment.scheduledAt);
    dateLabel = format(when, 'EEE, MMM d, yyyy');
    timeLabel = format(when, 'h:mm a');
  } catch {
    dateLabel = appointment.scheduledAt;
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.referenceRow}>
          <View style={styles.referenceChip}>
            <Text style={styles.referenceText}>{appointment.reference}</Text>
          </View>
          <Badge badge={status} />
        </View>
        {!NO_PAYMENT_BADGE_STATUSES.has(appointment.status) && (
          <Badge badge={paymentBadge(appointment.paymentStatus)} />
        )}
      </View>

      <View style={styles.detailSection}>
        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="business-outline" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.detailText}>{appointment.departmentName}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="medkit-outline" size={16} color="#16A34A" />
          </View>
          <Text style={styles.detailText}>{appointment.doctorName}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={[styles.detailIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time-outline" size={16} color="#D97706" />
          </View>
          <Text style={styles.detailText}>
            {dateLabel} · {timeLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
    marginRight: 8,
  },
  referenceChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  referenceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.3,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailSection: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flexShrink: 1,
  },
});
