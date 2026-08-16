import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Share, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';
import { useMedicalStore } from '@/stores/medical-store';

interface EmergencyShareSheetProps {
  visible: boolean;
  onClose: () => void;
  patientName: string;
}

// A large, plain-text "hand your phone to the clinician" view — record data
// only, nothing interpreted. The Share button hands the same text off to
// the OS share sheet (Messages, WhatsApp, etc.) so it can travel with the
// patient; no network call is made by the app itself.
export default function EmergencyShareSheet({ visible, onClose, patientName }: EmergencyShareSheetProps) {
  const bloodGroup = useMedicalStore((state) => state.bloodGroup);
  const allergies = useMedicalStore((state) => state.allergies);
  const conditions = useMedicalStore((state) => state.conditions);
  const emergencyContact = useMedicalStore((state) => state.emergencyContact);

  const summaryLines = [
    `${patientName} — Emergency Medical ID`,
    `Blood Group: ${bloodGroup ?? 'Not recorded'}`,
    `Allergies: ${allergies.length ? allergies.map((a) => a.label).join(', ') : 'None recorded'}`,
    `Conditions: ${conditions.length ? conditions.map((c) => c.label).join(', ') : 'None recorded'}`,
    `Emergency Contact: ${emergencyContact.name || 'Not recorded'}${
      emergencyContact.relationship ? ` (${emergencyContact.relationship})` : ''
    }${emergencyContact.phone ? ` — ${emergencyContact.phone}` : ''}`,
  ];

  const handleShare = () => {
    Share.share({ message: summaryLines.join('\n') });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Emergency ID Card</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={styles.body}>
            <Text style={styles.hint}>Show this screen to a clinician, or share it below.</Text>

            <Text style={styles.patientName}>{patientName}</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Blood Group</Text>
              <Text style={styles.rowValue}>{bloodGroup ?? 'Not recorded'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Allergies</Text>
              <Text style={styles.rowValue}>
                {allergies.length ? allergies.map((a) => a.label).join(', ') : 'None recorded'}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Conditions</Text>
              <Text style={styles.rowValue}>
                {conditions.length ? conditions.map((c) => c.label).join(', ') : 'None recorded'}
              </Text>
            </View>

            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <Text style={styles.rowLabel}>Emergency Contact</Text>
              <Text style={styles.rowValue}>
                {emergencyContact.name || 'Not recorded'}
                {emergencyContact.relationship ? ` (${emergencyContact.relationship})` : ''}
                {emergencyContact.phone ? `\n${emergencyContact.phone}` : ''}
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.85}>
            <Ionicons name="share-outline" size={18} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '75%',
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
  body: { paddingHorizontal: 20, paddingTop: 12 },
  hint: { fontSize: 13, color: '#9CA3AF', marginBottom: 16 },
  patientName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rowValue: { fontSize: 16, fontWeight: '600', color: '#111827', lineHeight: 22 },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  shareButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
