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
import { useInsuranceStore } from '@/stores/insurance-store';

const SCHEME_OPTIONS = [
  'NHIS',
  'GLICO Healthcare',
  'Acacia Health',
  'Nationwide Medical',
  'Cosmopolitan Health',
  'Other',
];

function FieldRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[fieldStyles.row, !isLast && fieldStyles.rowBorder]}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Text style={fieldStyles.value}>{value || '—'}</Text>
    </View>
  );
}

export default function InsuranceDetailsCard() {
  const scheme = useInsuranceStore((state) => state.scheme);
  const membershipNumber = useInsuranceStore((state) => state.membershipNumber);
  const cardholderName = useInsuranceStore((state) => state.cardholderName);
  const expiryDate = useInsuranceStore((state) => state.expiryDate);
  const setInsuranceDetails = useInsuranceStore((state) => state.setInsuranceDetails);

  const [modalVisible, setModalVisible] = useState(false);
  const [schemeChoice, setSchemeChoice] = useState<string | null>(null);
  const [customScheme, setCustomScheme] = useState('');
  const [membershipInput, setMembershipInput] = useState('');
  const [cardholderInput, setCardholderInput] = useState('');
  const [expiryInput, setExpiryInput] = useState('');

  const openEdit = () => {
    if (scheme && !SCHEME_OPTIONS.slice(0, -1).includes(scheme)) {
      setSchemeChoice('Other');
      setCustomScheme(scheme);
    } else {
      setSchemeChoice(scheme);
      setCustomScheme('');
    }
    setMembershipInput(membershipNumber);
    setCardholderInput(cardholderName);
    setExpiryInput(expiryDate ?? '');
    setModalVisible(true);
  };

  const handleSave = () => {
    const finalScheme = schemeChoice === 'Other' ? customScheme.trim() || null : schemeChoice;
    const details = {
      scheme: finalScheme,
      membershipNumber: membershipInput.trim(),
      cardholderName: cardholderInput.trim(),
      expiryDate: expiryInput.trim() || null,
    };
    setInsuranceDetails(details);
    setModalVisible(false);
    void import('@/lib/api/patient')
      .then(({ putInsurance }) => putInsurance(details))
      .catch(() => Alert.alert('Could not save', 'Check your connection and try again.'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="document-text-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>DETAILS</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={openEdit} activeOpacity={0.7}>
          <Ionicons name="pencil" size={14} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Edit insurance details</Text>
        </TouchableOpacity>
      </View>

      <FieldRow label="Scheme" value={scheme ?? ''} />
      <FieldRow label="Membership Number" value={membershipNumber} />
      <FieldRow label="Cardholder Name" value={cardholderName} />
      <FieldRow label="Expiry Date" value={expiryDate ?? ''} isLast />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          {/* KAV so the keyboard never covers the inputs (bug-triage FE-27) */}
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Edit Insurance Details</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.sheetBody}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Scheme</Text>
                <View style={styles.schemeGrid}>
                  {SCHEME_OPTIONS.map((option) => {
                    const active = schemeChoice === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.schemeChip, active && styles.schemeChipActive]}
                        onPress={() => setSchemeChoice(option)}>
                        <Text
                          style={[styles.schemeChipText, active && styles.schemeChipTextActive]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {schemeChoice === 'Other' && (
                  <TextInput
                    value={customScheme}
                    onChangeText={setCustomScheme}
                    placeholder="Enter scheme name"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, { marginTop: 12 }]}
                  />
                )}

                <Text style={[styles.inputLabel, { marginTop: 16 }]}>Membership Number</Text>
                <TextInput
                  value={membershipInput}
                  onChangeText={setMembershipInput}
                  placeholder="e.g. 12345678"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  value={cardholderInput}
                  onChangeText={setCardholderInput}
                  placeholder="e.g. Kelvin Quarcoo"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  value={expiryInput}
                  onChangeText={setExpiryInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  onSubmitEditing={handleSave}
                  returnKeyType="done"
                />
              </ScrollView>

              {/* Fixed footer — non-scrolling ScrollView so iOS keyboard-tap
                  handling never swallows the first tap (bug-triage FE-31). */}
              <ScrollView
                style={styles.sheetFooter}
                contentContainerStyle={styles.sheetFooterContent}
                scrollEnabled={false}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
                  <Text style={styles.confirmButtonText}>Save</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  row: { paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: { fontSize: 15, fontWeight: '600', color: '#111827' },
});

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
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  editButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

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
  sheetBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexShrink: 1 },
  sheetFooter: { paddingHorizontal: 20, paddingTop: 8, flexGrow: 0 },
  sheetFooterContent: { paddingBottom: 24 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  schemeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  schemeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  schemeChipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  schemeChipText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
  schemeChipTextActive: { color: COLORS.primary },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
