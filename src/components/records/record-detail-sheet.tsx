import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RecordDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  footerNote?: string;
  children: React.ReactNode;
}

// Shared bottom-sheet shell for the "full panel" / "full detail" views
// across Visits, Lab Results, and Prescriptions.
export default function RecordDetailSheet({
  visible,
  onClose,
  title,
  footerNote,
  children,
}: RecordDetailSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {children}
            {footerNote && <Text style={styles.footerNote}>{footerNote}</Text>}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// Small label/value row reused by the detail sheets — neutral styling only,
// no color or weight varies with the value.
export function DetailFieldRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[fieldRowStyles.row, !isLast && fieldRowStyles.rowBorder]}>
      <Text style={fieldRowStyles.label}>{label}</Text>
      <Text style={fieldRowStyles.value}>{value}</Text>
    </View>
  );
}

const fieldRowStyles = StyleSheet.create({
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
  sheetTitle: { fontSize: 16, fontWeight: '800', color: '#111827', flex: 1, marginRight: 12 },
  sheetBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 20,
  },
});
