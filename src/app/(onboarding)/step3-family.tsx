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
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormHeading, TopProgressBar } from '@/components/progress-header';
import { COLORS } from '@/constants/theme';

// Generates a code like "MENS-4821"
function generateFamilyCode(name: string): string {
  const prefix = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${suffix}`;
}

export default function StepThreeFamilyScreen() {
  const router = useRouter();

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Family
  const [familyMode, setFamilyMode] = useState<'join' | 'create'>('join');
  const [familyCode, setFamilyCode] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isFormValid =
    emergencyName.trim() !== '' && emergencyRel.trim() !== '' && emergencyPhone.trim().length >= 10;

  const handleCreateFamily = () => {
    if (!newFamilyName.trim()) return;
    const code = generateFamilyCode(newFamilyName);
    setGeneratedCode(code);
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    await Clipboard.setStringAsync(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!generatedCode) return;
    await Share.share({
      message: `Join my family on Pulse! Use code: ${generatedCode}`,
    });
  };

  const handleSwitchMode = (mode: 'join' | 'create') => {
    setFamilyMode(mode);
    setGeneratedCode(null);
    setNewFamilyName('');
    setFamilyCode('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <TopProgressBar currentStep={3} totalSteps={3} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <FormHeading
            currentStep={3}
            totalSteps={3}
            title="Your Network."
            subtitle="Connect with your family and set up your emergency contacts."
          />

          {/* FAMILY NETWORK */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Family Network</Text>

            {/* Segmented toggle */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                onPress={() => handleSwitchMode('join')}
                style={[styles.segmentBtn, familyMode === 'join' && styles.segmentBtnActive]}>
                <Text
                  style={[styles.segmentText, familyMode === 'join' && styles.segmentTextActive]}>
                  Join Family
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSwitchMode('create')}
                style={[styles.segmentBtn, familyMode === 'create' && styles.segmentBtnActive]}>
                <Text
                  style={[styles.segmentText, familyMode === 'create' && styles.segmentTextActive]}>
                  Create New
                </Text>
              </TouchableOpacity>
            </View>

            {/* JOIN — same inputCard style as everything else */}
            {familyMode === 'join' && (
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Family Code</Text>
                <TextInput
                  placeholder="e.g. MNSH-1234"
                  placeholderTextColor="#9CA3AF"
                  style={[styles.inputField, styles.codeFont]}
                  autoCapitalize="characters"
                  value={familyCode}
                  onChangeText={setFamilyCode}
                />
              </View>
            )}

            {/* CREATE — same inputCard, with inline Create button + code reveal */}
            {familyMode === 'create' && (
              <View>
                <View style={[styles.inputCard, !generatedCode && styles.inputCardSpaced]}>
                  <Text style={styles.inputLabel}>Family Name</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      placeholder="e.g. The Mensah Family"
                      placeholderTextColor="#9CA3AF"
                      style={[styles.inputField, { flex: 1 }]}
                      autoCapitalize="words"
                      value={newFamilyName}
                      onChangeText={(t) => {
                        setNewFamilyName(t);
                        setGeneratedCode(null);
                      }}
                      editable={!generatedCode}
                    />
                    {!generatedCode ? (
                      <TouchableOpacity
                        onPress={handleCreateFamily}
                        disabled={!newFamilyName.trim()}
                        style={[
                          styles.createBtn,
                          !newFamilyName.trim() && styles.createBtnDisabled,
                        ]}>
                        <Text style={styles.createBtnText}>Create</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setGeneratedCode(null);
                          setNewFamilyName('');
                        }}>
                        <Text style={styles.changeLink}>Change</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* CODE REVEAL */}
                {generatedCode && (
                  <View style={styles.codeRevealCard}>
                    <View style={styles.codeRevealTop}>
                      <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                      <Text style={styles.codeRevealTitle}>Family Created!</Text>
                    </View>
                    <Text style={styles.codeRevealHint}>
                      Share this code with family members so they can join.
                    </Text>
                    <View style={styles.codeBox}>
                      <Text style={styles.codeText}>{generatedCode}</Text>
                    </View>
                    <View style={styles.codeActions}>
                      <TouchableOpacity onPress={handleCopy} style={styles.codeActionBtn}>
                        <Ionicons
                          name={copied ? 'checkmark' : 'copy-outline'}
                          size={16}
                          color={COLORS.primary}
                        />
                        <Text style={styles.codeActionText}>{copied ? 'Copied!' : 'Copy'}</Text>
                      </TouchableOpacity>
                      <View style={styles.codeActionDivider} />
                      <TouchableOpacity onPress={handleShare} style={styles.codeActionBtn}>
                        <Ionicons name="share-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.codeActionText}>Share</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* EMERGENCY CONTACT */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Emergency Contact</Text>

            <View style={[styles.inputCard, styles.inputCardSpaced]}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                placeholder="e.g. Grace Mensah"
                placeholderTextColor="#9CA3AF"
                style={styles.inputField}
                autoCapitalize="words"
                value={emergencyName}
                onChangeText={setEmergencyName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputCard, styles.flex1]}>
                <Text style={styles.inputLabel}>Relationship</Text>
                <TextInput
                  placeholder="e.g. Mother"
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputField}
                  value={emergencyRel}
                  onChangeText={setEmergencyRel}
                />
              </View>
              <View style={[styles.inputCard, styles.flex15]}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  placeholder="024 123 4567"
                  placeholderTextColor="#9CA3AF"
                  style={styles.inputField}
                  keyboardType="phone-pad"
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                />
              </View>
            </View>
          </View>

          {/* FINISH */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.finishBtn, { backgroundColor: isFormValid ? COLORS.primary : '#93C5FD' }]}
              disabled={!isFormValid}
              onPress={() => router.replace('/(tabs)/home')}>
              <Text style={styles.finishBtnText}>Complete Setup</Text>
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
  scrollContent: { flexGrow: 1, paddingBottom: 40 },

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

  // Segmented control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  segmentBtnActive: { backgroundColor: '#fff', elevation: 2 },
  segmentText: { fontWeight: '700', color: '#6B7280' },
  segmentTextActive: { color: '#111827' },

  // Unified input card
  inputCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputCardSpaced: { marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  inputField: { color: '#111827', fontSize: 16, fontWeight: '500', padding: 0 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeFont: { fontWeight: '700', letterSpacing: 3 },

  // Inline create button
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  createBtnDisabled: { backgroundColor: '#BFDBFE' },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  changeLink: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },

  // Code reveal card
  codeRevealCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
  },
  codeRevealTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  codeRevealTitle: { fontWeight: '700', color: '#15803D', fontSize: 14 },
  codeRevealHint: { color: '#4B5563', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  codeBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  codeText: { fontSize: 26, fontWeight: '800', letterSpacing: 6, color: '#111827' },
  codeActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  codeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  codeActionText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  codeActionDivider: { width: 1, height: 18, backgroundColor: '#D1FAE5' },

  // Row layout
  row: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },
  flex15: { flex: 1.5 },

  // Footer
  footer: { marginTop: 'auto', paddingTop: 16 },
  finishBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  finishBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
