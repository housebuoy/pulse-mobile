import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { Visit } from '@/stores/records-store';
import RecordDetailSheet, { DetailFieldRow } from './record-detail-sheet';

interface VisitDetailSheetProps {
  visit: Visit | null;
  onClose: () => void;
}

// Renderer accepts both the store's string[] shape and a plain string, so a
// backend that sends either form degrades gracefully instead of crashing.
function toLines(value: string[] | string | null | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function DetailLines({ label, lines }: { label: string; lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.summaryBox}>
        {lines.map((line, index) => (
          <Text key={index} style={[styles.summaryText, index < lines.length - 1 && styles.lineGap]}>
            {line}
          </Text>
        ))}
      </View>
    </>
  );
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

          <DetailLines label="Symptoms" lines={toLines(visit.symptoms)} />
          <DetailLines label="Recommendations" lines={toLines(visit.recommendations)} />
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
  lineGap: { marginBottom: 8 },
});
