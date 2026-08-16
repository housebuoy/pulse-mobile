import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMedicalStore } from '@/stores/medical-store';

interface RecordVitalsModalProps {
  visible: boolean;
  onClose: () => void;
}

// Pure capture — every field is optional, and nothing here compares a
// value to a "normal" range. It just gets written to the log as-is.
export default function RecordVitalsModal({ visible, onClose }: RecordVitalsModalProps) {
  const addVitalsEntry = useMedicalStore((state) => state.addVitalsEntry);

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulseBpm, setPulseBpm] = useState('');
  const [temperatureC, setTemperatureC] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const reset = () => {
    setSystolic('');
    setDiastolic('');
    setPulseBpm('');
    setTemperatureC('');
    setHeightCm('');
    setWeightKg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const hasAnyValue = [systolic, diastolic, pulseBpm, temperatureC, heightCm, weightKg].some(
    (v) => v.trim().length > 0
  );

  const handleSave = () => {
    if (!hasAnyValue) return;
    addVitalsEntry({
      systolic: systolic.trim() || undefined,
      diastolic: diastolic.trim() || undefined,
      pulseBpm: pulseBpm.trim() || undefined,
      temperatureC: temperatureC.trim() || undefined,
      heightCm: heightCm.trim() || undefined,
      weightKg: weightKg.trim() || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Record Vitals</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.hint}>Leave anything blank you don&apos;t want to record.</Text>

            <Text style={styles.inputLabel}>Blood Pressure (mmHg)</Text>
            <View style={styles.row}>
              <TextInput
                value={systolic}
                onChangeText={setSystolic}
                placeholder="Systolic"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                style={[styles.input, styles.rowInput]}
              />
              <TextInput
                value={diastolic}
                onChangeText={setDiastolic}
                placeholder="Diastolic"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                style={[styles.input, styles.rowInput]}
              />
            </View>

            <Text style={styles.inputLabel}>Pulse (bpm)</Text>
            <TextInput
              value={pulseBpm}
              onChangeText={setPulseBpm}
              placeholder="e.g. 72"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Temperature (°C)</Text>
            <TextInput
              value={temperatureC}
              onChangeText={setTemperatureC}
              placeholder="e.g. 36.8"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.rowInput}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  value={heightCm}
                  onChangeText={setHeightCm}
                  placeholder="e.g. 178"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.rowInput}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="e.g. 74"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, !hasAnyValue && styles.confirmButtonDisabled]}
              disabled={!hasAnyValue}
              onPress={handleSave}>
              <Text style={styles.confirmButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableOpacity>
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
  hint: { fontSize: 13, color: '#9CA3AF', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  rowInput: { flex: 1 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
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
  confirmButtonDisabled: { backgroundColor: '#93C5FD' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
