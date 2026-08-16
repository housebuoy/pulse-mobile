import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { formatGHS, usePaymentsStore } from '@/stores/payments-store';

export default function PaymentHistoryCard() {
  const paymentHistory = usePaymentsStore((state) => state.paymentHistory);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="receipt-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>PAYMENT HISTORY</Text>
        </View>
      </View>

      {paymentHistory.length === 0 ? (
        <Text style={styles.emptyText}>No payments yet</Text>
      ) : (
        paymentHistory.map((entry, index) => (
          <View
            key={entry.id}
            style={[styles.row, index !== paymentHistory.length - 1 && styles.rowBorder]}>
            <View style={styles.checkBox}>
              <Ionicons name="checkmark" size={14} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.description} numberOfLines={1}>
                Booking fee · {entry.department}
              </Text>
              <Text style={styles.sub} numberOfLines={1}>
                {entry.facilityName} · {entry.methodLabel} · {format(parseISO(entry.paidDate), 'MMM d')}
              </Text>
            </View>
            <Text style={styles.amount}>{formatGHS(entry.amount)}</Text>
          </View>
        ))
      )}
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
    marginBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  emptyText: { fontSize: 14, color: '#9CA3AF', paddingVertical: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  amount: { fontSize: 14, fontWeight: '700', color: '#111827' },
});
