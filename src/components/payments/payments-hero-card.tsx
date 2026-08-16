import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatGHS, usePaymentsStore } from '@/stores/payments-store';
import PayBookingSheet from './pay-booking-sheet';

export default function PaymentsHeroCard() {
  const outstandingBookings = usePaymentsStore((state) => state.outstandingBookings);
  const [payAllVisible, setPayAllVisible] = useState(false);

  const amountDue = outstandingBookings.reduce((sum, b) => sum + b.feeAmount, 0);
  const count = outstandingBookings.length;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <Text style={styles.eyebrow}>AMOUNT DUE</Text>
        <Text style={styles.amount}>{formatGHS(amountDue)}</Text>
        <Text style={styles.subtitle}>
          {count === 0
            ? 'No outstanding booking fees'
            : `${count} unpaid booking${count > 1 ? 's' : ''}`}
        </Text>

        {count > 0 && (
          <TouchableOpacity
            style={styles.payButton}
            activeOpacity={0.85}
            onPress={() => setPayAllVisible(true)}>
            <Ionicons name="flash-outline" size={16} color="#1D4ED8" />
            <Text style={styles.payButtonText}>Pay now</Text>
          </TouchableOpacity>
        )}

        <Ionicons name="card" size={110} color="rgba(255,255,255,0.08)" style={styles.bgIcon} />
      </LinearGradient>

      <PayBookingSheet
        visible={payAllVisible}
        onClose={() => setPayAllVisible(false)}
        bookings={outstandingBookings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  amount: { fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: 20 },
  payButton: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  payButtonText: { fontSize: 14, fontWeight: '800', color: '#1D4ED8' },
  bgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
});
