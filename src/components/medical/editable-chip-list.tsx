import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export interface ChipTypeOption {
  value: string;
  label: string;
}

export interface ChipItem {
  id: string;
  label: string;
  type?: string;
}

interface EditableChipListProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBgColor: string;
  iconColor: string;
  items: ChipItem[];
  typeOptions?: ChipTypeOption[];
  onAdd: (label: string, type?: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  addLabel: string;
  inputPlaceholder: string;
  emptyText: string;
  danger?: boolean;
}

// Shared editable "chip" card used for both Allergies and Conditions — a
// record of what the patient has reported, nothing more. `danger` only
// tints the chips so allergies read distinctly from conditions; it never
// changes based on the value itself.
export default function EditableChipList({
  title,
  iconName,
  iconBgColor,
  iconColor,
  items,
  typeOptions,
  onAdd,
  onRemove,
  addLabel,
  inputPlaceholder,
  emptyText,
  danger,
}: EditableChipListProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [label, setLabel] = useState('');
  const [selectedType, setSelectedType] = useState(typeOptions?.[0]?.value);

  const typeLabelFor = (type?: string) => typeOptions?.find((t) => t.value === type)?.label;

  const closeModal = () => {
    setModalVisible(false);
    setLabel('');
    setSelectedType(typeOptions?.[0]?.value);
  };

  const handleAdd = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    // Close instantly (optimistic) — the persist runs in the background and
    // rolls back + alerts on failure (bug-triage FE-29). Awaiting the network
    // here made the modal linger for seconds.
    closeModal();
    onAdd(trimmed, selectedType).catch(() =>
      Alert.alert('Could not save', 'Check your connection and try again.')
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
            <Ionicons name={iconName} size={18} color={iconColor} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}>
          <Ionicons name="add" size={16} color={COLORS.primary} />
          <Text style={styles.addButtonText}>{addLabel}</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        <View style={styles.chipsRow}>
          {items.map((item) => (
            <View key={item.id} style={[styles.chip, danger && styles.chipDanger]}>
              <View>
                <Text style={[styles.chipText, danger && styles.chipTextDanger]}>{item.label}</Text>
                {typeLabelFor(item.type) && (
                  <Text style={[styles.chipSubText, danger && styles.chipSubTextDanger]}>
                    {typeLabelFor(item.type)}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  onRemove(item.id).catch(() =>
                    Alert.alert('Could not remove', 'Check your connection and try again.')
                  );
                }}
                hitSlop={8}
                style={styles.chipRemove}>
                <Ionicons name="close" size={14} color={danger ? COLORS.danger : '#6B7280'} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal}>
          {/* KAV + ScrollView so the keyboard never covers the input (bug-triage FE-27) */}
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Add {title.replace(/s$/, '')}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.sheetBody}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}>
                {typeOptions && (
                  <View style={styles.typeRow}>
                    {typeOptions.map((opt) => {
                      const active = selectedType === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.typePill, active && styles.typePillActive]}
                          onPress={() => setSelectedType(opt.value)}>
                          <Text style={[styles.typePillText, active && styles.typePillTextActive]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <TextInput
                  value={label}
                  onChangeText={setLabel}
                  placeholder={inputPlaceholder}
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoFocus
                  onSubmitEditing={handleAdd}
                  returnKeyType="done"
                />
              </ScrollView>

              {/* Fixed footer: the Add button lives OUTSIDE the main ScrollView.
                  It sits in its own non-scrolling ScrollView with
                  keyboardShouldPersistTaps="always" so iOS's keyboard-tap
                  handling never swallows the first tap (bug-triage FE-31). */}
              <ScrollView
                style={styles.sheetFooter}
                contentContainerStyle={styles.sheetFooterContent}
                scrollEnabled={false}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.confirmButton, !label.trim() && styles.confirmButtonDisabled]}
                  disabled={!label.trim()}
                  onPress={handleAdd}>
                  <Text style={styles.confirmButtonText}>Add</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  chipDanger: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  chipText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  chipTextDanger: { color: COLORS.danger },
  chipSubText: { fontSize: 10, fontWeight: '600', color: '#60A5FA', marginTop: 1 },
  chipSubTextDanger: { color: '#F87171' },
  chipRemove: { padding: 2 },

  // Add modal
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
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typePill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  typePillActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  typePillText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
  typePillTextActive: { color: COLORS.primary },
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
  },
  confirmButtonDisabled: { backgroundColor: '#93C5FD' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
