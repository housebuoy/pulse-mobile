import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Visit } from '@/stores/records-store';
import RecordDetailSheet, { DetailFieldRow } from './record-detail-sheet';

interface VisitDetailSheetProps {
  visit: Visit | null;
  onClose: () => void;
}

export default function VisitDetailSheet({ visit, onClose }: VisitDetailSheetProps) {
  return (
    <RecordDetailSheet visible={!!visit} onClose={onClose} title={visit?.department ?? ''}>
      {visit && (
        <>
          <DetailFieldRow label="Hospital" value={visit.hospital} />
          <DetailFieldRow label="Doctor" value={visit.doctor} />
          <DetailFieldRow label="Date" value={format(parseISO(visit.date), 'MMMM d, yyyy')} isLast />

          <Text style={styles.sectionLabel}>Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{visit.summary}</Text>
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
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  summaryText: { fontSize: 14, color: '#374151', lineHeight: 22 },
});
