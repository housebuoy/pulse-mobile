import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import {
  DATE_PRESET_OPTIONS,
  DEFAULT_RECORDS_FILTER,
  DatePreset,
  RecordsFilterState,
} from '@/utils/records-filter';

interface RecordsFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filter: RecordsFilterState;
  onApply: (filter: RecordsFilterState) => void;
  hospitalOptions: string[];
  doctorOptions: string[];
  typeLabel: string;
  typeOptions: string[];
}

function ChipGroup<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onSelect(opt.value)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function RecordsFilterSheet({
  visible,
  onClose,
  filter,
  onApply,
  hospitalOptions,
  doctorOptions,
  typeLabel,
  typeOptions,
}: RecordsFilterSheetProps) {
  const [local, setLocal] = useState<RecordsFilterState>(filter);

  useEffect(() => {
    if (visible) setLocal(filter);
  }, [visible, filter]);

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleClear = () => {
    setLocal(DEFAULT_RECORDS_FILTER);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Filter Records</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Date Range</Text>
            <ChipGroup
              options={DATE_PRESET_OPTIONS}
              selected={local.datePreset}
              onSelect={(datePreset: DatePreset) => setLocal((prev) => ({ ...prev, datePreset }))}
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>{typeLabel}</Text>
            <ChipGroup
              options={[
                { value: '', label: 'Any' },
                ...typeOptions.map((opt) => ({ value: opt, label: opt })),
              ]}
              selected={local.type ?? ''}
              onSelect={(value: string) => setLocal((prev) => ({ ...prev, type: value || null }))}
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Hospital</Text>
            <ChipGroup
              options={[
                { value: '', label: 'Any' },
                ...hospitalOptions.map((opt) => ({ value: opt, label: opt })),
              ]}
              selected={local.hospital ?? ''}
              onSelect={(value: string) => setLocal((prev) => ({ ...prev, hospital: value || null }))}
            />

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Doctor</Text>
            <ChipGroup
              options={[
                { value: '', label: 'Any' },
                ...doctorOptions.map((opt) => ({ value: opt, label: opt })),
              ]}
              selected={local.doctor ?? ''}
              onSelect={(value: string) => setLocal((prev) => ({ ...prev, doctor: value || null }))}
            />

            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear} activeOpacity={0.7}>
                <Text style={styles.clearButtonText}>Clear filters</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.85}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    maxWidth: '100%',
  },
  chipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
  chipTextActive: { color: COLORS.primary },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    marginBottom: 32,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  clearButtonText: { fontSize: 15, fontWeight: '700', color: '#4B5563' },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  applyButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
