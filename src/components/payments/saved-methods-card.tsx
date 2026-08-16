import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { usePaymentsStore } from '@/stores/payments-store';
import NetworkBadge from './network-badge';
import AddPaymentMethodSheet from './add-payment-method-sheet';

export default function SavedMethodsCard() {
  const paymentMethods = usePaymentsStore((state) => state.paymentMethods);
  const setDefaultPaymentMethod = usePaymentsStore((state) => state.setDefaultPaymentMethod);
  const removePaymentMethod = usePaymentsStore((state) => state.removePaymentMethod);

  const [addVisible, setAddVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="wallet-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>PAYMENT METHODS</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddVisible(true)} activeOpacity={0.7}>
          <Ionicons name="add" size={16} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {paymentMethods.length === 0 ? (
        <Text style={styles.emptyText}>No payment methods saved</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {paymentMethods.map((method) => {
            return (
              <View key={method.id} style={styles.methodRow}>
                <NetworkBadge network={method.network} size={32} />
                <Text style={styles.methodLabel}>{method.label}</Text>
                {method.isDefault ? (
                  <View style={styles.defaultPill}>
                    <Text style={styles.defaultPillText}>Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setDefaultPaymentMethod(method.id)}
                    hitSlop={8}
                    style={styles.setDefaultBtn}>
                    <Text style={styles.setDefaultText}>Set default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => removePaymentMethod(method.id)}
                  hitSlop={8}
                  style={styles.removeBtn}>
                  <Ionicons name="close" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      <AddPaymentMethodSheet visible={addVisible} onClose={() => setAddVisible(false)} />
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
  },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 2, padding: 4 },
  addButtonText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  emptyText: { fontSize: 14, color: '#9CA3AF', paddingVertical: 4 },

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  methodLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  defaultPill: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  defaultPillText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  setDefaultBtn: { padding: 4 },
  setDefaultText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  removeBtn: { padding: 4, marginLeft: 4 },
});
