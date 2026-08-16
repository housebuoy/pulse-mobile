import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, formatDistanceToNowStrict, isPast, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { OutstandingBooking, formatGHS, usePaymentsStore } from '@/stores/payments-store';
import PayBookingSheet from './pay-booking-sheet';

// Purely descriptive — the app never cancels a booking or releases a slot
// itself. It only reflects the pay-by date the backend assigned. See the
// BACKEND_SPEC note in payments-store.ts.
function describeDeadline(deadlineIso: string) {
  const deadline = parseISO(deadlineIso);
  const passed = isPast(deadline);
  const absolute = format(deadline, 'MMM d, h:mm a');
  const relative = formatDistanceToNowStrict(deadline);
  return { passed, absolute, relative };
}

function BookingRow({ booking, onPress }: { booking: OutstandingBooking; onPress: () => void }) {
  const { passed, absolute, relative } = describeDeadline(booking.payByDeadline);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowTop}>
        <View style={styles.rowLeft}>
          <Text style={styles.facility} numberOfLines={1}>
            {booking.facilityName}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {booking.department} · {format(parseISO(booking.appointmentDate), 'MMM d')}
          </Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.fee}>{formatGHS(booking.feeAmount)}</Text>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </View>
      </View>

      <View style={styles.deadlineBlock}>
        <View style={styles.deadlineUrgentRow}>
          <Ionicons name="time-outline" size={12} color={COLORS.warning} />
          <Text style={styles.deadlineUrgentText} numberOfLines={1}>
            {passed ? 'Pay-by time passed' : `Pay within ${relative} or your slot is released`}
          </Text>
        </View>
        <Text style={styles.deadlineDueText} numberOfLines={1}>
          Due {absolute}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OutstandingPaymentsCard() {
  const outstandingBookings = usePaymentsStore((state) => state.outstandingBookings);
  const [selectedBooking, setSelectedBooking] = useState<OutstandingBooking | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="hourglass-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>OUTSTANDING PAYMENTS</Text>
        </View>
      </View>

      {outstandingBookings.length === 0 ? (
        <Text style={styles.emptyText}>No outstanding payments — you&apos;re all caught up</Text>
      ) : (
        <View style={{ gap: 12 }}>
          {outstandingBookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} onPress={() => setSelectedBooking(booking)} />
          ))}
        </View>
      )}

      <PayBookingSheet
        visible={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        bookings={selectedBooking ? [selectedBooking] : []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#DBEAFE',
  },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 14, color: '#9CA3AF', paddingVertical: 4 },

  row: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  rowLeft: { flex: 1, paddingRight: 12 },
  facility: { fontSize: 15, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fee: { fontSize: 16, fontWeight: '800', color: '#111827' },

  deadlineBlock: { marginTop: 10, gap: 2 },
  deadlineUrgentRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  deadlineUrgentText: { fontSize: 12, fontWeight: '600', color: '#92400E', flexShrink: 1 },
  deadlineDueText: { fontSize: 11, color: '#9CA3AF' },
});
