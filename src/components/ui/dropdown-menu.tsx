import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export interface DropdownOption {
  label: string; // what the user sees
  value: string; // what your code uses
}

interface DropdownProps {
  options: DropdownOption[];
  selected: string | null;        // the current value
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;                 // optional field label above the button
  activeColor?: string;
}

export default function Dropdown({
  options,
  selected,
  onSelect,
  placeholder = 'Select an option',
  label,
  activeColor = COLORS.primary,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === selected);

  const handleSelect = (value: string) => {
    onSelect(value);
    setOpen(false);
  };

  return (
    <>
      {/* Optional label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Trigger button */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}>
        <Text style={[styles.triggerText, !selectedOption && styles.placeholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#6B7280"
        />
      </TouchableOpacity>

      {/* Picker modal */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>

            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label ?? placeholder}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Options list */}
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}>
              {options.map((option, index) => {
                const isSelected = option.value === selected;
                const isLast = index === options.length - 1;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={[
                      styles.option,
                      !isLast && styles.optionBorder,
                      isSelected && { backgroundColor: activeColor + '10' },
                    ]}
                    activeOpacity={0.7}>
                    <Text style={[
                      styles.optionText,
                      isSelected && { color: activeColor, fontWeight: '700' },
                    ]}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={activeColor} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  triggerText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  placeholder: { color: '#9CA3AF', fontWeight: '400' },

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end', // sheet slides up from bottom
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '60%',
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

  optionsList: { paddingHorizontal: 8, paddingBottom: 32 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 10,
  },
  optionBorder: { borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  optionText: { fontSize: 15, color: '#374151', fontWeight: '500' },
});