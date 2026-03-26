import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme'; // Ensure this points to your theme file

interface MonthSelectorProps {
  selectedMonth: Date; // first day of the month e.g. new Date(2025, 9, 1)
  onMonthChange: (newMonth: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  activeColor?: string;
  readOnly?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function MonthSelector({
  selectedMonth,
  onMonthChange,
  minDate,
  maxDate,
  activeColor = COLORS.primary,
  readOnly = false,
}: MonthSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedMonth.getFullYear());

  const today = new Date();
  const effectiveMin = minDate ?? new Date(today.getFullYear(), today.getMonth(), 1);
  const effectiveMax = maxDate ?? new Date(today.getFullYear() + 1, 11, 1);

  const displayLabel = `${MONTH_NAMES[selectedMonth.getMonth()]} ${selectedMonth.getFullYear()}`;

  //   const canGoPrev = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1) >= effectiveMin;
  //   const canGoNext = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1) <= effectiveMax;

  //   const goToPrev = () => {
  //     if (!canGoPrev) return;
  //     onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  //   };

  //   const goToNext = () => {
  //     if (!canGoNext) return;
  //     onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  //   };

  const selectMonth = (monthIndex: number) => {
    const candidate = new Date(pickerYear, monthIndex, 1);
    if (candidate >= effectiveMin && candidate <= effectiveMax) {
      onMonthChange(candidate);
      setModalVisible(false);
    }
  };

  const isMonthDisabled = (monthIndex: number) => {
    const candidate = new Date(pickerYear, monthIndex, 1);
    return candidate < effectiveMin || candidate > effectiveMax;
  };

  return (
    <>
      <View style={styles.container}>
        {/* Prev arrow */}
        {/* <TouchableOpacity
          onPress={goToPrev}
          disabled={!canGoPrev}
          style={[styles.arrowBtn, !canGoPrev && styles.arrowDisabled]}>
          <Ionicons name="chevron-back" size={18} color={canGoPrev ? activeColor : '#D1D5DB'} />
        </TouchableOpacity> */}

        {/* Label — tap opens picker */}
        <TouchableOpacity
          style={styles.labelBtn}
          onPress={() => {
            setPickerYear(selectedMonth.getFullYear());
            setModalVisible(true);
          }}
          activeOpacity={0.7}
          disabled={readOnly}>
          <Text style={[styles.labelText, { color: activeColor }]}>{displayLabel}</Text>
          {!readOnly && (
            <Ionicons name="chevron-down" size={13} color={activeColor} style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>

        {/* Next arrow */}
        {/* <TouchableOpacity
          onPress={goToNext}
          disabled={!canGoNext}
          style={[styles.arrowBtn, !canGoNext && styles.arrowDisabled]}>
          <Ionicons name="chevron-forward" size={18} color={canGoNext ? activeColor : '#D1D5DB'} />
        </TouchableOpacity> */}
      </View>

      {/* PICKER MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {/* Year row */}
            <View style={styles.yearRow}>
              <TouchableOpacity
                onPress={() => setPickerYear((y) => y - 1)}
                disabled={pickerYear <= effectiveMin.getFullYear()}
                style={styles.arrowBtn}>
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={pickerYear > effectiveMin.getFullYear() ? activeColor : '#D1D5DB'}
                />
              </TouchableOpacity>
              <Text style={styles.yearText}>{pickerYear}</Text>
              <TouchableOpacity
                onPress={() => setPickerYear((y) => y + 1)}
                disabled={pickerYear >= effectiveMax.getFullYear()}
                style={styles.arrowBtn}>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={pickerYear < effectiveMax.getFullYear() ? activeColor : '#D1D5DB'}
                />
              </TouchableOpacity>
            </View>

            {/* Month grid */}
            <View style={styles.monthGrid}>
              {MONTH_NAMES.map((name, idx) => {
                const disabled = isMonthDisabled(idx);
                const isActive =
                  idx === selectedMonth.getMonth() && pickerYear === selectedMonth.getFullYear();
                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => selectMonth(idx)}
                    disabled={disabled}
                    style={[
                      styles.monthCell,
                      isActive && { backgroundColor: activeColor },
                      disabled && styles.monthCellDisabled,
                    ]}>
                    <Text
                      style={[
                        styles.monthCellText,
                        isActive && styles.monthCellTextActive,
                        disabled && styles.monthCellTextDisabled,
                      ]}>
                      {name.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  arrowBtn: { padding: 8, borderRadius: 999, backgroundColor: '#F3F4F6' },
  arrowDisabled: { opacity: 0.4 },
  labelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    // paddingHorizontal: 14,
    paddingVertical: 0,
    borderRadius: 999,
    // backgroundColor: '#EFF6FF',
  },
  labelText: { fontSize: 15, fontWeight: '700' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  sheet: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  yearText: { fontSize: 18, fontWeight: '800', color: '#111827' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  monthCell: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  monthCellDisabled: { opacity: 0.3 },
  monthCellText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  monthCellTextActive: { color: '#fff' },
  monthCellTextDisabled: { color: '#9CA3AF' },
});
