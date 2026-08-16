import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMedicalStore } from '@/stores/medical-store';
import EmergencyShareSheet from './emergency-share-sheet';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface EmergencyIdCardProps {
  patientName: string;
}

export default function EmergencyIdCard({ patientName }: EmergencyIdCardProps) {
  const bloodGroup = useMedicalStore((state) => state.bloodGroup);
  const setBloodGroup = useMedicalStore((state) => state.setBloodGroup);
  const allergies = useMedicalStore((state) => state.allergies);

  const [bloodGroupPickerOpen, setBloodGroupPickerOpen] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>EMERGENCY ID</Text>
            <Text style={styles.patientName}>{patientName}</Text>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.8}
            onPress={() => setShareVisible(true)}>
            <Ionicons name="qr-code-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.bodyRow}>
          <TouchableOpacity
            style={styles.bloodGroupBox}
            activeOpacity={0.8}
            onPress={() => setBloodGroupPickerOpen(true)}>
            <Text style={styles.bloodGroupLabel}>Blood Group</Text>
            <Text style={styles.bloodGroupValue}>{bloodGroup ?? '—'}</Text>
          </TouchableOpacity>

          <View style={styles.allergyPreview}>
            <Text style={styles.allergyLabel}>Key Allergies</Text>
            {allergies.length ? (
              <View style={styles.allergyChipsRow}>
                {allergies.slice(0, 3).map((allergy) => (
                  <View key={allergy.id} style={styles.allergyChip}>
                    <Text style={styles.allergyChipText}>{allergy.label}</Text>
                  </View>
                ))}
                {allergies.length > 3 && (
                  <Text style={styles.allergyMore}>+{allergies.length - 3} more</Text>
                )}
              </View>
            ) : (
              <Text style={styles.allergyEmpty}>None recorded</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.shareHint}
          activeOpacity={0.8}
          onPress={() => setShareVisible(true)}>
          <Ionicons name="eye-outline" size={14} color="rgba(255,255,255,0.85)" />
          <Text style={styles.shareHintText}>Tap to show a clinician</Text>
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        visible={bloodGroupPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBloodGroupPickerOpen(false)}>
        <TouchableOpacity
          style={styles.pickerBackdrop}
          activeOpacity={1}
          onPress={() => setBloodGroupPickerOpen(false)}>
          <View style={styles.pickerSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Blood Group</Text>
              <TouchableOpacity onPress={() => setBloodGroupPickerOpen(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerGrid}>
              {BLOOD_GROUPS.map((group) => {
                const active = bloodGroup === group;
                return (
                  <TouchableOpacity
                    key={group}
                    style={[styles.pickerChip, active && styles.pickerChipActive]}
                    onPress={() => {
                      setBloodGroup(group);
                      setBloodGroupPickerOpen(false);
                    }}>
                    <Text style={[styles.pickerChipText, active && styles.pickerChipTextActive]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <EmergencyShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        patientName={patientName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  patientName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 16,
  },
  bloodGroupBox: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bloodGroupValue: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  allergyPreview: { flex: 1, justifyContent: 'center' },
  allergyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  allergyChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  allergyChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  allergyChipText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  allergyMore: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  allergyEmpty: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  shareHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  shareHintText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 16,
  },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pickerChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  pickerChipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  pickerChipText: { fontSize: 15, fontWeight: '700', color: '#4B5563' },
  pickerChipTextActive: { color: COLORS.primary },
});
