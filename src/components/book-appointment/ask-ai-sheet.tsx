import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { DEPARTMENTS, DepartmentOption } from '@/constants/departments';

interface AskAiSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectDepartment: (value: string) => void;
}

// Non-diagnostic keyword routing only — this maps a few common words to a
// DEPARTMENT, nothing else. It never scores severity, never says what a
// symptom "means," and falls back to General OPD rather than guessing.
const KEYWORD_MAP: { value: string; keywords: string[] }[] = [
  { value: 'dental', keywords: ['tooth', 'teeth', 'gum', 'dental', 'cavity'] },
  { value: 'eye', keywords: ['eye', 'vision', 'blurry', 'sight'] },
  { value: 'cardiology', keywords: ['heart', 'chest', 'palpitation', 'cardiac'] },
  { value: 'pediatrics', keywords: ['child', 'baby', 'infant', 'kid'] },
];

function findDepartment(text: string): DepartmentOption {
  const lower = text.toLowerCase();
  const match = KEYWORD_MAP.find((entry) => entry.keywords.some((kw) => lower.includes(kw)));
  const value = match?.value ?? 'general';
  return DEPARTMENTS.find((d) => d.value === value) ?? DEPARTMENTS[0];
}

export default function AskAiSheet({ visible, onClose, onSelectDepartment }: AskAiSheetProps) {
  const [description, setDescription] = useState('');
  const [suggestion, setSuggestion] = useState<DepartmentOption | null>(null);

  const handleClose = () => {
    setDescription('');
    setSuggestion(null);
    onClose();
  };

  const handleFind = () => {
    if (!description.trim()) return;
    setSuggestion(findDepartment(description));
  };

  const handleUseDepartment = () => {
    if (suggestion) onSelectDepartment(suggestion.value);
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Ask AI</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} keyboardShouldPersistTaps="handled">
            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
              <Text style={styles.disclaimerText}>
                This helps you find the right department or hospital to book with — it does not
                diagnose, assess severity, or give medical advice.
              </Text>
            </View>

            <Text style={styles.inputLabel}>What&apos;s going on?</Text>
            <TextInput
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setSuggestion(null);
              }}
              placeholder="e.g. I have a toothache that started yesterday"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.findButton, !description.trim() && styles.findButtonDisabled]}
              disabled={!description.trim()}
              onPress={handleFind}
              activeOpacity={0.85}>
              <Text style={styles.findButtonText}>Find a department</Text>
            </TouchableOpacity>

            {suggestion && (
              <View style={styles.resultCard}>
                <Text style={styles.resultLabel}>Suggested department</Text>
                <Text style={styles.resultDepartment}>{suggestion.label}</Text>
                <Text style={styles.resultNote}>
                  This is a booking suggestion only, not a diagnosis. A clinician will assess you at
                  your visit.
                </Text>
                <TouchableOpacity style={styles.useButton} onPress={handleUseDepartment} activeOpacity={0.85}>
                  <Text style={styles.useButtonText}>Use this department</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.browseButton} onPress={handleClose} activeOpacity={0.7}>
                  <Text style={styles.browseButtonText}>Browse departments myself</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.sosNote}>
              <Ionicons name="warning-outline" size={14} color="#DC2626" />
              <Text style={styles.sosNoteText}>For emergencies, use the SOS button instead of booking.</Text>
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
  sheetBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },

  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  disclaimerText: { flex: 1, fontSize: 12, color: '#1D4ED8', lineHeight: 17 },

  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  findButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  findButtonDisabled: { backgroundColor: '#93C5FD' },
  findButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  resultCard: {
    marginTop: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  resultDepartment: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  resultNote: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 16 },
  useButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  useButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  browseButton: { paddingVertical: 8, alignItems: 'center' },
  browseButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  sosNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  sosNoteText: { fontSize: 12, color: '#9CA3AF', flexShrink: 1 },
});
