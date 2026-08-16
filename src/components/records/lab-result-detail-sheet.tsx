import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { LabResult } from '@/stores/records-store';
import RecordDetailSheet, { DetailFieldRow } from './record-detail-sheet';

interface LabResultDetailSheetProps {
  labResult: LabResult | null;
  onClose: () => void;
}

// Values render exactly as recorded — same neutral color regardless of the
// number, and the reference range (when present) is plain text, never a
// judgment on the value next to it.
export default function LabResultDetailSheet({ labResult, onClose }: LabResultDetailSheetProps) {
  return (
    <RecordDetailSheet
      visible={!!labResult}
      onClose={onClose}
      title={labResult?.testName ?? ''}
      footerNote="Values are shown exactly as recorded by the lab. Pulse does not interpret or flag results.">
      {labResult && (
        <>
          <DetailFieldRow label="Hospital" value={labResult.hospital} />
          <DetailFieldRow label="Ordering Doctor" value={labResult.orderingDoctor} />
          <DetailFieldRow label="Date" value={format(parseISO(labResult.date), 'MMMM d, yyyy')} isLast />

          <Text style={styles.sectionLabel}>Values</Text>
          <View style={styles.valuesList}>
            {labResult.values.map((v, index) => (
              <View
                key={v.name}
                style={[styles.valueRow, index !== labResult.values.length - 1 && styles.valueRowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.valueName}>{v.name}</Text>
                  {v.referenceRange && <Text style={styles.referenceRange}>Reference: {v.referenceRange}</Text>}
                </View>
                <Text style={styles.valueText}>
                  {v.value}
                  {v.unit ? ` ${v.unit}` : ''}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </RecordDetailSheet>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 8,
  },
  valuesList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  valueRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  valueName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  referenceRange: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  valueText: { fontSize: 15, fontWeight: '700', color: '#111827', marginLeft: 12 },
});
