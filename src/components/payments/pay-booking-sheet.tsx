import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { OutstandingBooking, formatGHS, usePaymentsStore } from '@/stores/payments-store';
import NetworkBadge from './network-badge';
import AddPaymentMethodSheet from './add-payment-method-sheet';

interface PayBookingSheetProps {
  visible: boolean;
  onClose: () => void;
  bookings: OutstandingBooking[];
}

// MOCK checkout — selecting "Pay" here marks the booking(s) paid locally.
// A real integration would hand the selected method's gateway token to a
// payment provider SDK and only settle once the charge is confirmed.
export default function PayBookingSheet({ visible, onClose, bookings }: PayBookingSheetProps) {
  const paymentMethods = usePaymentsStore((state) => state.paymentMethods);
  const payBookings = usePaymentsStore((state) => state.payBookings);

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [addMethodVisible, setAddMethodVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      const defaultMethod = paymentMethods.find((m) => m.isDefault) ?? paymentMethods[0];
      setSelectedMethodId(defaultMethod?.id ?? null);
    }
  }, [visible, paymentMethods]);

  const total = bookings.reduce((sum, b) => sum + b.feeAmount, 0);

  const handlePay = async () => {
    if (!selectedMethodId) return;
    try {
      await payBookings(
        bookings.map((b) => b.id),
        selectedMethodId
      );
      onClose();
      Alert.alert(
        'Checkout opened',
        'Complete payment in the browser. Your bookings update after the hospital confirms.'
      );
    } catch (e) {
      Alert.alert('Payment failed', e instanceof Error ? e.message : 'Try again');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Pay Booking Fee{bookings.length > 1 ? 's' : ''}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} keyboardShouldPersistTaps="handled">
            <View style={styles.bookingsList}>
              {bookings.map((b) => (
                <View key={b.id} style={styles.bookingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bookingFacility}>{b.facilityName}</Text>
                    <Text style={styles.bookingSub}>
                      {b.department} · {format(parseISO(b.appointmentDate), 'MMM d, yyyy')}
                    </Text>
                  </View>
                  <Text style={styles.bookingFee}>{formatGHS(b.feeAmount)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatGHS(total)}</Text>
            </View>

            <Text style={styles.inputLabel}>Pay With</Text>

            {paymentMethods.length === 0 ? (
              <Text style={styles.emptyMethodsText}>
                You don&apos;t have a saved payment method yet.
              </Text>
            ) : (
              <View style={styles.methodsList}>
                {paymentMethods.map((method) => {
                  const active = selectedMethodId === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[styles.methodRow, active && styles.methodRowActive]}
                      onPress={() => setSelectedMethodId(method.id)}
                      activeOpacity={0.7}>
                      <NetworkBadge network={method.network} size={32} />
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={active ? COLORS.primary : '#D1D5DB'}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={styles.addMethodLink}
              onPress={() => setAddMethodVisible(true)}
              activeOpacity={0.7}>
              <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.addMethodLinkText}>Add a payment method</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, !selectedMethodId && styles.confirmButtonDisabled]}
              disabled={!selectedMethodId}
              onPress={handlePay}>
              <Text style={styles.confirmButtonText}>Pay {formatGHS(total)}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>

      <AddPaymentMethodSheet
        visible={addMethodVisible}
        onClose={() => setAddMethodVisible(false)}
        onAdded={(methodId) => setSelectedMethodId(methodId)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, maxHeight: '85%' },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sheetBody: { paddingHorizontal: 20, paddingTop: 16 },

  bookingsList: { marginBottom: 4 },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bookingFacility: { fontSize: 14, fontWeight: '700', color: '#111827' },
  bookingSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  bookingFee: { fontSize: 14, fontWeight: '700', color: '#111827' },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  emptyMethodsText: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  methodsList: { gap: 8, marginBottom: 4 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  methodRowActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  methodLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },

  addMethodLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addMethodLinkText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmButtonDisabled: { backgroundColor: '#93C5FD' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
