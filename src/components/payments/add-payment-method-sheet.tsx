import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { PaymentNetwork, usePaymentsStore } from '@/stores/payments-store';
import NetworkBadge from './network-badge';

const NETWORK_OPTIONS: { value: PaymentNetwork; label: string }[] = [
  { value: 'mtn_momo', label: 'MTN MoMo' },
  { value: 'telecel_cash', label: 'Telecel Cash' },
  { value: 'card', label: 'Card' },
];

const CARD_BRANDS = ['Visa', 'Mastercard'];

const GHANA_MOMO_RE = /^0\d{9}$/; // 0200433286

interface AddPaymentMethodSheetProps {
  visible: boolean;
  onClose: () => void;
  onAdded?: (methodId: string) => void;
}

// MoMo wallets save the full 10-digit wallet number (it is a phone number,
// shown in full — the method's identifier). Cards still collect only the
// last 4 digits as a display aid; never a PAN/PIN/CVV.
export default function AddPaymentMethodSheet({
  visible,
  onClose,
  onAdded,
}: AddPaymentMethodSheetProps) {
  const addPaymentMethod = usePaymentsStore((state) => state.addPaymentMethod);
  const paymentMethods = usePaymentsStore((state) => state.paymentMethods);

  const [network, setNetwork] = useState<PaymentNetwork>('mtn_momo');
  const [brand, setBrand] = useState('Visa');
  const [digits, setDigits] = useState('');
  const [saving, setSaving] = useState(false);

  const isCard = network === 'card';

  const reset = () => {
    setNetwork('mtn_momo');
    setBrand('Visa');
    setDigits('');
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isValid = isCard ? digits.length === 4 : GHANA_MOMO_RE.test(digits);

  const handleSave = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await addPaymentMethod(network, digits.trim(), isCard ? brand : undefined);
      const newest = usePaymentsStore.getState().paymentMethods.at(-1);
      reset();
      onClose();
      if (newest) onAdded?.(newest.id);
    } catch {
      Alert.alert(
        'Could not save method',
        'Please check the number and try again.',
        [{ text: 'OK' }]
      );
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Network</Text>
              <View style={styles.networkGrid}>
                {NETWORK_OPTIONS.map((opt) => {
                  const active = network === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.networkChip, active && styles.networkChipActive]}
                      onPress={() => setNetwork(opt.value)}>
                      <NetworkBadge network={opt.value} size={20} />
                      <Text
                        style={[styles.networkChipText, active && styles.networkChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {network === 'card' && (
                <>
                  <Text style={[styles.inputLabel, { marginTop: 16 }]}>Card Brand</Text>
                  <View style={styles.networkGrid}>
                    {CARD_BRANDS.map((b) => {
                      const active = brand === b;
                      return (
                        <TouchableOpacity
                          key={b}
                          style={[styles.networkChip, active && styles.networkChipActive]}
                          onPress={() => setBrand(b)}>
                          <Text
                            style={[
                              styles.networkChipText,
                              active && styles.networkChipTextActive,
                            ]}>
                            {b}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={[styles.inputLabel, { marginTop: 16 }]}>
                {isCard ? 'Last 4 Digits' : 'Mobile Money Number'}{' '}
                <Text style={styles.inputLabelHint}>
                  ({isCard ? 'of your card' : 'your 10-digit wallet number'})
                </Text>
              </Text>
              <TextInput
                value={digits}
                onChangeText={(text) =>
                  setDigits(text.replace(/[^0-9]/g, '').slice(0, isCard ? 4 : 10))
                }
                placeholder={isCard ? 'e.g. 4567' : 'e.g. 0200433286'}
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={isCard ? 4 : 10}
                style={styles.input}
              />
              <Text style={styles.hint}>
                {isCard
                  ? 'We never ask for or store your full card number, PIN, or CVV — just enough to help you recognize this method later.'
                  : 'Your wallet number is how this method is identified. We store it in full so charges go to the right wallet.'}
              </Text>

              <TouchableOpacity
                style={[styles.confirmButton, (!isValid || saving) && styles.confirmButtonDisabled]}
                disabled={!isValid || saving}
                onPress={handleSave}>
                <Text style={styles.confirmButtonText}>
                  {saving
                    ? 'Saving…'
                    : paymentMethods.length === 0
                      ? 'Save as Default'
                      : 'Save Method'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '85%',
  },
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
  sheetBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  inputLabelHint: { textTransform: 'none', letterSpacing: 0, fontWeight: '500' },
  networkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  networkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  networkChipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  networkChipText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
  networkChipTextActive: { color: COLORS.primary },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  hint: { fontSize: 12, color: '#9CA3AF', lineHeight: 17, marginBottom: 20 },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmButtonDisabled: { backgroundColor: '#93C5FD' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
