import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { VitalsEntry, useMedicalStore } from '@/stores/medical-store';
import RecordVitalsModal from './record-vitals-modal';

// Every metric renders in the same neutral color no matter its value —
// this is a log, not an assessment. A reading of 180/110 looks exactly
// like a reading of 120/80.
function VitalsMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function computeBmi(entry: VitalsEntry): string | null {
  const heightCm = parseFloat(entry.heightCm ?? '');
  const weightKg = parseFloat(entry.weightKg ?? '');
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (!isFinite(bmi)) return null;
  return bmi.toFixed(1);
}

function VitalsEntryCard({ entry }: { entry: VitalsEntry }) {
  const bmi = computeBmi(entry);
  const metrics: { label: string; value: string }[] = [];

  if (entry.systolic || entry.diastolic) {
    metrics.push({
      label: 'Blood Pressure',
      value: `${entry.systolic ?? '—'}/${entry.diastolic ?? '—'} mmHg`,
    });
  }
  if (entry.pulseBpm) metrics.push({ label: 'Pulse', value: `${entry.pulseBpm} bpm` });
  if (entry.temperatureC) metrics.push({ label: 'Temperature', value: `${entry.temperatureC} °C` });
  if (entry.heightCm) metrics.push({ label: 'Height', value: `${entry.heightCm} cm` });
  if (entry.weightKg) metrics.push({ label: 'Weight', value: `${entry.weightKg} kg` });
  if (bmi) metrics.push({ label: 'BMI', value: bmi });

  return (
    <View style={styles.entryCard}>
      <Text style={styles.entryDate}>{format(parseISO(entry.date), 'MMM d, yyyy')}</Text>
      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <VitalsMetric key={m.label} label={m.label} value={m.value} />
        ))}
      </View>
    </View>
  );
}

export default function VitalsLogCard() {
  const vitals = useMedicalStore((state) => state.vitals);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="pulse-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>VITALS LOG</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}>
          <Ionicons name="add" size={16} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Record vitals</Text>
        </TouchableOpacity>
      </View>

      {vitals.length === 0 ? (
        <Text style={styles.emptyText}>No vitals recorded yet</Text>
      ) : (
        <View style={styles.entries}>
          {vitals.map((entry) => (
            <VitalsEntryCard key={entry.id} entry={entry} />
          ))}
        </View>
      )}

      <RecordVitalsModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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

  entries: { gap: 12 },
  entryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  metric: { minWidth: '28%' },
  metricLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  metricValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
});
