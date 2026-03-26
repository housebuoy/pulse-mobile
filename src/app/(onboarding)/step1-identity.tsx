import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  //   KeyboardAvoidingView,
  //   Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopProgressBar, FormHeading } from '../../components/progress-header';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS } from '@/constants/theme';

export default function StepOneIdentityScreen() {
  const router = useRouter();

  const [titleVal, setTitleVal] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const titles = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.', 'Rev.'];

  const isFormValid =
    titleVal !== '' &&
    firstName.trim() !== '' &&
    surname.trim() !== '' &&
    dob.length >= 8 &&
    selectedGender !== null;

  const handleDobChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length >= 5) {
      cleaned = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    setDob(cleaned);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/*
        FIX: On Android, KeyboardAvoidingView behavior="height" shrinks the whole
        container and hides inputs behind the keyboard. The correct approach is:
        - iOS: keep "padding" (works perfectly)
        - Android: set behavior={undefined} and let ScrollView + keyboardShouldPersistTaps
          handle it naturally. The ScrollView will scroll the focused input into view.
      */}
      <View style={styles.navWrapper}>
        <TopProgressBar currentStep={1} totalSteps={3} />
      </View>
      <KeyboardAwareScrollView
        style={styles.keyboardView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // These three props are the secret weapon for Android:
        enableOnAndroid={true}
        extraScrollHeight={20} // Adds 20px of breathing room between the input and the keyboard
        enableAutomaticScroll={true}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          // FIX: This is the key Android prop — automatically scrolls the focused
          // input into view above the keyboard
          keyboardDismissMode="interactive">
          <FormHeading
            currentStep={1}
            totalSteps={3}
            title="Personal Details."
            subtitle="To ensure accurate medical records and easy folder retrieval, please provide your legal details."
          />

          {/* TITLE SELECTOR */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Title</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {titles.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTitleVal(t)}
                  style={[
                    styles.pillBtn,
                    titleVal === t ? styles.pillActive : styles.pillInactive,
                  ]}>
                  <Text
                    style={[
                      styles.pillText,
                      titleVal === t ? styles.pillTextActive : styles.pillTextInactive,
                    ]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* INPUT FIELDS */}
          <View style={styles.fieldsContainer}>
            {/* First & Surname Row */}
            <View style={styles.row}>
              <View style={[styles.inputCard, styles.flex1]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  placeholder="Kelvin"
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputField}
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={setFirstName}
                  textContentType='givenName'
                />
              </View>
              <View style={[styles.inputCard, styles.flex1]}>
                <Text style={styles.inputLabel}>Surname</Text>
                <TextInput
                  placeholder="Mensah"
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputField}
                  autoCapitalize="words"
                  value={surname}
                  onChangeText={setSurname}
                  textContentType='familyName'
                />
              </View>
            </View>

            {/* Other Names */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Other Names (Optional)</Text>
              <TextInput
                placeholder="e.g. Kwesi, Junior"
                placeholderTextColor="#9CA3AF"
                style={styles.inputField}
                autoCapitalize="words"
                value={otherNames}
                onChangeText={setOtherNames}
              />
              <Text style={styles.helperText}>Separate multiple names with a comma</Text>
            </View>

            {/* DOB & Gender Row */}
            <View style={styles.row}>
              <View style={[styles.inputCard, styles.flex1]}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TextInput
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputField}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={dob}
                  onChangeText={handleDobChange}
                  textContentType='dateTime'
                />
              </View>

              <View style={[styles.inputCard, styles.flex1]}>
                <Text style={styles.inputLabel}>Sex</Text>
                <View style={styles.genderRow}>
                  <TouchableOpacity
                    onPress={() => setSelectedGender('M')}
                    style={[styles.genderBtn, selectedGender === 'M' && styles.genderBtnActive]}>
                    <Text
                      style={[
                        styles.genderText,
                        selectedGender === 'M' && styles.genderTextActive,
                      ]}>
                      M
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setSelectedGender('F')}
                    style={[styles.genderBtn, selectedGender === 'F' && styles.genderBtnActive]}>
                    <Text
                      style={[
                        styles.genderText,
                        selectedGender === 'F' && styles.genderTextActive,
                      ]}>
                      F
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                placeholder="For medical receipts"
                placeholderTextColor="#9CA3AF"
                style={styles.inputField}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* CONTINUE BUTTON — FIX: no shadow className */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: isFormValid ? COLORS.primary : '#93C5FD' }]}
              disabled={!isFormValid}
              onPress={() => router.push('/(onboarding)/step2-clinical')}>
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1, paddingHorizontal: 24 },
  navWrapper: { width: '100%', paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

  // Section
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // Title pills
  pillBtn: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
  },
  pillActive: { backgroundColor: '#EFF6FF', borderColor: COLORS.primary },
  pillInactive: { backgroundColor: '#fff', borderColor: '#F3F4F6' },
  pillText: { fontWeight: '700', fontSize: 14 },
  pillTextActive: { color: COLORS.primary },
  pillTextInactive: { color: '#4B5563' },

  // Fields
  fieldsContainer: { gap: 16, marginBottom: 24 },
  row: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },

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
  helperText: { marginTop: 4, fontSize: 10, color: '#9CA3AF' },

  // Gender
  genderRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  genderBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  genderBtnActive: { backgroundColor: '#2563EB' },
  genderText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  genderTextActive: { color: '#fff' },

  // Footer
  footer: { marginTop: 'auto', paddingTop: 16 },
  continueBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  continueBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
