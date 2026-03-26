import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormHeading, TopProgressBar } from '@/components/progress-header';
import { COLORS } from '@/constants/theme';


export default function StepTwoClinicalScreen() {
  const router = useRouter();

  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [insuranceType, setInsuranceType] = useState('');
  const [insuranceId, setInsuranceId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrivate, setSelectedPrivate] = useState('');

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const insuranceOptions = ['NHIS', 'Private', 'Out of Pocket'];
  const privateProviders = [
    'Acacia Health',
    'GLICO Healthcare',
    'Nationwide Medical',
    'Cosmopolitan Health',
    'Apex Health',
    'Premier Health',
    'Vitality',
  ];
  const filteredProviders = privateProviders.filter((p) =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFormValid = bloodType !== '' && (insuranceType !== 'Private' || selectedPrivate !== '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* TOP NAV */}
        <TopProgressBar currentStep={2} totalSteps={3} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* HEADING */}
          <FormHeading
            currentStep={2}
            totalSteps={3}
            title="Clinical Profile."
            subtitle="Help doctors treat you faster and streamline your hospital billing."
          />

          {/* BLOOD TYPE */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Blood Type</Text>
            <View style={styles.bloodTypeGrid}>
              {bloodTypes.map((type) => {
                const active = bloodType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setBloodType(type)}
                    style={[
                      styles.bloodTypeBtn,
                      type === 'Unknown' && styles.bloodTypeBtnWide,
                      active ? styles.chipActive : styles.chipInactive,
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        active ? styles.chipTextActive : styles.chipTextInactive,
                      ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ALLERGIES */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Known Allergies</Text>
              <TextInput
                placeholder="e.g. Penicillin (Leave blank if none)"
                placeholderTextColor="#9CA3AF"
                style={styles.textArea}
                multiline
                numberOfLines={2}
                value={allergies}
                onChangeText={setAllergies}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* INSURANCE */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Health Insurance</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.insuranceRow}>
              {insuranceOptions.map((opt) => {
                const active = insuranceType === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => {
                      setInsuranceType(opt);
                      setSelectedPrivate('');
                      setSearchQuery('');
                    }}
                    style={[styles.pillBtn, active ? styles.chipActive : styles.chipInactive]}>
                    <Text
                      style={[
                        styles.chipText,
                        active ? styles.chipTextActive : styles.chipTextInactive,
                      ]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* NHIS */}
            {insuranceType === 'NHIS' && (
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>NHIS Number</Text>
                <TextInput
                  placeholder="e.g. 12345678"
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputField}
                  value={insuranceId}
                  onChangeText={setInsuranceId}
                />
              </View>
            )}

            {/* PRIVATE */}
            {insuranceType === 'Private' && (
              <View style={styles.privateContainer}>
                {selectedPrivate ? (
                  <View>
                    <View style={styles.selectedProviderRow}>
                      <Text style={styles.selectedProviderName}>{selectedPrivate}</Text>
                      <TouchableOpacity onPress={() => setSelectedPrivate('')}>
                        <Text style={styles.changeLink}>Change</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputCard}>
                      <Text style={styles.inputLabel}>Policy Number</Text>
                      <TextInput
                        placeholder="e.g. ACA-098765"
                        placeholderTextColor="#9CA3AF"
                        style={styles.inputField}
                        value={insuranceId}
                        onChangeText={setInsuranceId}
                      />
                    </View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.searchRow}>
                      <Ionicons name="search" size={20} color="#9CA3AF" />
                      <TextInput
                        placeholder="Search provider..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>
                    {/* FIX: Every item in this list uses pure style — no className anywhere */}
                    <View style={styles.providerList}>
                      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                        {filteredProviders.map((provider, index) => (
                          <TouchableOpacity
                            key={provider}
                            onPress={() => setSelectedPrivate(provider)}
                            style={[
                              styles.providerItem,
                              index === filteredProviders.length - 1 && styles.providerItemLast,
                            ]}>
                            <Text style={styles.providerItemText}>{provider}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* CONTINUE BUTTON — FIX: no shadow className, pure style only */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: isFormValid ? COLORS.primary : '#93C5FD' }]}
              disabled={!isFormValid}
              onPress={() => router.push('/(onboarding)/step3-family')}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1, paddingHorizontal: 24 },

  // Top nav
  topNav: { width: '100%', marginTop: 16, marginBottom: 24 },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  skipText: { color: '#9CA3AF', fontWeight: '600' },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', width: '66.66%', backgroundColor: COLORS.primary, borderRadius: 999 },

  // Scroll
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  // Heading
  heading: { marginBottom: 32, marginTop: 8 },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { color: '#6B7280', fontSize: 15, lineHeight: 24 },

  // Section
  section: { marginBottom: 32 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 24 },

  // Blood type grid
  bloodTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  bloodTypeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  bloodTypeBtnWide: { flexGrow: 1, paddingHorizontal: 24 },

  // Chips (shared between blood type + insurance pills)
  chipActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  chipInactive: { backgroundColor: '#FFFFFF', borderColor: '#F3F4F6' },
  chipText: { fontWeight: '700', fontSize: 15 },
  chipTextActive: { color: COLORS.primary },
  chipTextInactive: { color: '#4B5563' },

  // Insurance pills
  insuranceRow: { marginBottom: 16 },
  pillBtn: {
    marginRight: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 2,
  },

  // Input card
  inputCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  inputField: { color: '#111827', fontSize: 16, fontWeight: '500', padding: 0 },
  textArea: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    minHeight: 48,
    textAlignVertical: 'top',
  },

  // Private insurance
  privateContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedProviderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedProviderName: { fontWeight: '700', color: '#111827', fontSize: 17 },
  changeLink: { color: COLORS.primary, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  searchInput: { flex: 1, marginLeft: 8, color: '#111827', fontSize: 15, padding: 0 },
  providerList: {
    maxHeight: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  providerItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  providerItemLast: { borderBottomWidth: 0 },
  providerItemText: { color: '#111827', fontWeight: '500' },

  // Footer
  footer: { marginTop: 'auto', paddingTop: 16 },
  continueBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
