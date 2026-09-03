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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { resetPassword } from '@/lib/api/auth';

const MIN_LENGTH = 8;

function isStrongEnough(password: string): boolean {
  return password.length >= MIN_LENGTH && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

const STRENGTH_ERROR = `Use at least ${MIN_LENGTH} characters, including a letter and a number`;

export default function NewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; resetToken?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!isStrongEnough(password)) {
      setError(STRENGTH_ERROR);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await resetPassword({
        identifier: params.phone ?? '',
        resetToken: params.resetToken ?? '',
        newPassword: password,
      });
      router.replace('/(auth)/reset-success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reset password');
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
            <View style={styles.header}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md shadow-blue-500/30">
                <Image
                  source={require('../../../assets/icons/splash-icon-light.png')}
                  style={{ width: 60, height: 50 }}
                />
              </View>
              <Text style={styles.brandLabel}>PULSE</Text>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>
                Create a new password for your{'\n'}account to sign back in.
              </Text>
            </View>

            {/* INPUTS */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="New Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Confirm New Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeBtn}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.hint}>{STRENGTH_ERROR}</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: COLORS.primary, opacity: busy ? 0.7 : 1 }]}
              disabled={busy}
              onPress={handleSubmit}>
              <Text style={styles.submitText}>{busy ? 'Resetting…' : 'Reset Password'}</Text>
            </TouchableOpacity>
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
  scrollContent: { flexGrow: 1, justifyContent: 'flex-start' },
inner: { flex: 1, justifyContent: 'flex-start', paddingBottom: 48, paddingTop: 8, },

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

  inputGroup: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input: { marginLeft: 12, flex: 1, fontSize: 16, color: '#111827' },
  eyeBtn: { padding: 4 },
  eyeIcon: { marginRight: 8 },
  hint: { marginTop: 8, marginBottom: 4, fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  errorText: { marginTop: 8, marginBottom: 8, textAlign: 'center', fontSize: 13, color: '#EF4444' },

  submitBtn: { marginTop: 16, marginBottom: 32, alignItems: 'center', borderRadius: 16, paddingVertical: 16 },
  submitText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});