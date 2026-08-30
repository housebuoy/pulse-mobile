import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import EmergencyIdCard from '@/components/medical/emergency-id-card';
import EditableChipList from '@/components/medical/editable-chip-list';
import MedicationsCard from '@/components/medical/medications-card';
import EmergencyContactCard from '@/components/medical/emergency-contact-card';
import VitalsLogCard from '@/components/medical/vitals-log-card';
import { useMedicalStore } from '@/stores/medical-store';
import { useProfileStore } from '@/stores/profile-store';

const ALLERGY_TYPE_OPTIONS = [
  { value: 'drug', label: 'Drug' },
  { value: 'food', label: 'Food' },
  { value: 'environmental', label: 'Environmental' },
];

export default function MedicalIdScreen() {
  const router = useRouter();
  // Real patient identity from the profile store (hydrated after login) —
  // previously a hardcoded mock name showed here (bug-triage FE-27).
  const identity = useProfileStore((state) => state.identity);

  const allergies = useMedicalStore((state) => state.allergies);
  const addAllergy = useMedicalStore((state) => state.addAllergy);
  const removeAllergy = useMedicalStore((state) => state.removeAllergy);

  const conditions = useMedicalStore((state) => state.conditions);
  const addCondition = useMedicalStore((state) => state.addCondition);
  const removeCondition = useMedicalStore((state) => state.removeCondition);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical ID & Vitals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <EmergencyIdCard
          patientName={identity ? `${identity.firstName} ${identity.lastName}`.trim() : ''}
        />

        <EditableChipList
          title="ALLERGIES"
          iconName="alert-circle-outline"
          iconBgColor="#FEE2E2"
          iconColor="#DC2626"
          items={allergies}
          typeOptions={ALLERGY_TYPE_OPTIONS}
          onAdd={(label, type) =>
            addAllergy(label, (type as 'drug' | 'food' | 'environmental') ?? 'drug')
          }
          onRemove={removeAllergy}
          addLabel="Add"
          inputPlaceholder="e.g. Penicillin"
          emptyText="No allergies recorded"
          danger
        />

        <EditableChipList
          title="CONDITIONS"
          iconName="fitness-outline"
          iconBgColor="#DBEAFE"
          iconColor="#2563EB"
          items={conditions}
          onAdd={(label) => addCondition(label)}
          onRemove={removeCondition}
          addLabel="Add"
          inputPlaceholder="e.g. Asthma"
          emptyText="No conditions recorded"
        />

        <MedicationsCard />

        <EmergencyContactCard />

        <VitalsLogCard />

        <Text style={styles.footerNote}>
          This is a personal record for your own reference and to share with clinicians. It is not
          medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: { padding: 8, width: 40 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
  },
});
