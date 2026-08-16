import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { MedicationEntry, useMedicalStore } from '@/stores/medical-store';

export default function MedicationsCard() {
  const medications = useMedicalStore((state) => state.medications);
  const addMedication = useMedicalStore((state) => state.addMedication);
  const updateMedication = useMedicalStore((state) => state.updateMedication);
  const removeMedication = useMedicalStore((state) => state.removeMedication);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<MedicationEntry | null>(null);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');

  const openAdd = () => {
    setEditing(null);
    setName('');
    setDose('');
    setModalVisible(true);
  };

  const openEdit = (medication: MedicationEntry) => {
    setEditing(medication);
    setName(medication.name);
    setDose(medication.dose);
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (editing) {
      updateMedication(editing.id, trimmedName, dose.trim());
    } else {
      addMedication(trimmedName, dose.trim());
    }
    closeModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="medkit-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>MEDICATIONS</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAdd} activeOpacity={0.7}>
          <Ionicons name="add" size={16} color={COLORS.primary} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {medications.length === 0 ? (
        <Text style={styles.emptyText}>No medications recorded</Text>
      ) : (
        medications.map((medication, index) => (
          <TouchableOpacity
            key={medication.id}
            style={[styles.medRow, index !== medications.length - 1 && styles.medRowBorder]}
            onPress={() => openEdit(medication)}
            activeOpacity={0.7}>
            <View style={styles.medInfo}>
              <Text style={styles.medName}>{medication.name}</Text>
              {!!medication.dose && <Text style={styles.medDose}>{medication.dose}</Text>}
            </View>
            <TouchableOpacity
              onPress={() => removeMedication(medication.id)}
              hitSlop={8}
              style={styles.medRemove}>
              <Ionicons name="close" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{editing ? 'Edit Medication' : 'Add Medication'}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Metformin"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                autoFocus
              />

              <Text style={styles.inputLabel}>Dose</Text>
              <TextInput
                value={dose}
                onChangeText={setDose}
                placeholder="e.g. 500mg, twice daily"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                onSubmitEditing={handleSave}
                returnKeyType="done"
              />

              <TouchableOpacity
                style={[styles.confirmButton, !name.trim() && styles.confirmButtonDisabled]}
                disabled={!name.trim()}
                onPress={handleSave}>
                <Text style={styles.confirmButtonText}>{editing ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
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

  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  medRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  medDose: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  medRemove: { padding: 4 },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8 },
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
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
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
