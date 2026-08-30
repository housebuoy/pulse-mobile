import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMedicalStore } from '@/stores/medical-store';
import { isValidGhanaPhone, PHONE_ERROR_MESSAGE } from '@/lib/phone';

export default function EmergencyContactCard() {
  const emergencyContact = useMedicalStore((state) => state.emergencyContact);
  const setEmergencyContact = useMedicalStore((state) => state.setEmergencyContact);

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState(emergencyContact.name);
  const [relationship, setRelationship] = useState(emergencyContact.relationship);
  const [phone, setPhone] = useState(emergencyContact.phone);

  const openEdit = () => {
    setName(emergencyContact.name);
    setRelationship(emergencyContact.relationship);
    setPhone(emergencyContact.phone);
    setModalVisible(true);
  };

  const handleSave = () => {
    const trimmedPhone = phone.trim();
    // Close instantly; persist in background; alert on failure (FE-29).
    if (trimmedPhone && !isValidGhanaPhone(trimmedPhone)) {
      Alert.alert('Invalid phone number', PHONE_ERROR_MESSAGE);
      return;
    }
    setModalVisible(false);
    setEmergencyContact({
      name: name.trim(),
      relationship: relationship.trim(),
      phone: trimmedPhone,
    }).catch(() => Alert.alert('Could not save', 'Check your connection and try again.'));
  };

  const hasContact = emergencyContact.name || emergencyContact.phone;

  const handleCall = () => {
    if (emergencyContact.phone) {
      Linking.openURL(`tel:${emergencyContact.phone}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="call-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.title}>EMERGENCY CONTACT</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openEdit} activeOpacity={0.7}>
          <Ionicons name={hasContact ? 'pencil' : 'add'} size={14} color={COLORS.primary} />
          <Text style={styles.addButtonText}>{hasContact ? 'Edit' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      {hasContact ? (
        <View style={styles.contactRow}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{emergencyContact.name || 'Not recorded'}</Text>
            <Text style={styles.contactSub}>
              {emergencyContact.relationship || '—'}
              {emergencyContact.phone ? ` · ${emergencyContact.phone}` : ''}
            </Text>
          </View>
          {!!emergencyContact.phone && (
            <TouchableOpacity style={styles.callButton} onPress={handleCall} activeOpacity={0.8}>
              <Ionicons name="call" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <Text style={styles.emptyText}>No emergency contact recorded</Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <KeyboardAvoidingView
            style={{ flex: 1, justifyContent: 'flex-end' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>EMERGENCY CONTACT</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Keyboard-safe body (bug-triage FE-27) */}
              <ScrollView
                style={styles.sheetBody}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Ama Quarcoo"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoFocus
                />

                <Text style={styles.inputLabel}>Relationship</Text>
                <TextInput
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="e.g. Sister"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g. +233 20 987 6543"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  keyboardType="phone-pad"
                  maxLength={13}
                  onSubmitEditing={handleSave}
                  returnKeyType="done"
                />
              </ScrollView>

              {/* Fixed footer — button outside the ScrollView so the first tap
                  is never swallowed by keyboard dismissal (bug-triage FE-31). */}
              <View style={styles.sheetFooter}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
                  <Text style={styles.confirmButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
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

  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  contactSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

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
  sheetFooter: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
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
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
