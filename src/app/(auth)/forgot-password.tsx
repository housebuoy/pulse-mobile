import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { requestPasswordReset } from '@/lib/api/auth';
import { isValidGhanaPhone, PHONE_ERROR_MESSAGE } from '@/lib/phone';

const IDENTIFIER_LABEL = 'Phone Number';
const IDENTIFIER_PLACEHOLDER = 'e.g. 024XXXXXXX';
const validateIdentifier = isValidGhanaPhone;
const IDENTIFIER_ERROR_MESSAGE = PHONE_ERROR_MESSAGE;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    const trimmed = identifier.trim();
    if (!validateIdentifier(trimmed)) {
      setError(IDENTIFIER_ERROR_MESSAGE);
      return;
    }
    setBusy(true);
    try {
      await requestPasswordReset(trimmed);
      router.push({ pathname: '/(auth)/otp', params: { phone: trimmed, context: 'reset' } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send reset code');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            {/* BRANDING — matches OTP screen */}
            <View style={styles.header}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md shadow-blue-500/30">
                <Image
                  source={require('../../../assets/icons/splash-icon-light.png')}
                  style={{ width: 60, height: 50 }}
                />
              </View>
              <Text style={styles.brandLabel}>PULSE</Text>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your {IDENTIFIER_LABEL.toLowerCase()} and we&apos;ll send you a 6-digit code
                to reset your password.
              </Text>
            </View>

            {/* INPUT */}
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder={IDENTIFIER_PLACEHOLDER}
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="phone-pad"
                autoCapitalize="none"
                maxLength={13}
                value={identifier}
                onChangeText={setIdentifier}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* SUBMIT */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: COLORS.primary, opacity: busy ? 0.7 : 1 },
              ]}
              disabled={busy}
              onPress={handleSubmit}>
              <Text style={styles.submitText}>{busy ? 'Sending code…' : 'Send Code'}</Text>
            </TouchableOpacity>

            <View style={styles.signInRow}>
  <Text style={styles.signInLabel}>Remember your password?</Text>
  <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
    <Text style={styles.signInLink}>Sign in</Text>
  </TouchableOpacity>
</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  backRow: { marginBottom: 8, marginTop: 16, width: '100%' },
  backBtn: { padding: 8, marginLeft: -8, width: 48 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  inner: { flex: 1, justifyContent: 'center', paddingBottom: 48 },

  // Header — same as OTP
  header: { marginBottom: 40, alignItems: 'center' },
  brandLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  title: {
    marginBottom: 8,
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    paddingHorizontal: 16,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    color: '#6B7280',
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  signInRow: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 32 },
signInLabel: { fontWeight: '500', color: '#9CA3AF' },
signInLink: { fontWeight: '700', color: COLORS.primary },
  input: { marginLeft: 12, flex: 1, fontSize: 16, color: '#111827' },

  errorText: { marginTop: 8, marginBottom: 8, textAlign: 'center', fontSize: 13, color: '#EF4444' },

  // Button
  submitBtn: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
  },
  submitText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
