import React, { useState, useRef, forwardRef } from 'react';
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


interface OTPInputProps {
  digit: string;
  isFocused: boolean;
  onChangeText: (text: string) => void;
  onKeyPress: (e: any) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const OTPInput = forwardRef<TextInput, OTPInputProps>(
  ({ digit, isFocused, onChangeText, onKeyPress, onFocus, onBlur }, ref) => {
    return (
      <View
        style={[
          styles.otpBox,
          isFocused || digit !== '' ? styles.otpBoxActive : styles.otpBoxInactive,
        ]}>
        <TextInput
          ref={ref}
          style={styles.otpInput}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={6}
          value={digit}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          onFocus={onFocus}
          onBlur={onBlur}
          selectionColor={COLORS.primary}
        />
      </View>
    );
  }
);

OTPInput.displayName = 'OTPInput';


export default function OTPScreen() {
  const router = useRouter();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);

  // Refs declared at the top level — never inside .map()
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleChangeText = (text: string, index: number) => {
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length > 1) {
      const pastedDigits = numericText.split('').slice(0, 6);
      const newCode = [...code];
      for (let i = 0; i < pastedDigits.length; i++) {
        if (index + i < 6) newCode[index + i] = pastedDigits[i];
      }
      setCode(newCode);
      const nextIndex = Math.min(index + pastedDigits.length, 5);
      inputRefs[nextIndex].current?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    if (numericText !== '' && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        inputRefs[index - 1].current?.focus();
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      }
    }
  };

  const isComplete = code.join('').length === 6;

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
            {/* BRANDING */}
            <View style={styles.header}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-md shadow-blue-500/30">
                <Image
                  source={require('../../../assets/icons/splash-icon-light.png')}
                  style={{ width: 60, height: 50 }}
                />
              </View>
              <Text style={styles.brandLabel}>PULSE</Text>
              <Text style={styles.title}>Verify your number.</Text>
              <Text style={styles.subtitle}>
                We&apos;ve sent a 6-digit secure code to{'\n'}
                <Text style={styles.phone}>+233 24 *** ****</Text>
              </Text>
            </View>

            {/* OTP INPUTS — now using the extracted OTPInput component */}
            <View style={styles.otpRow}>
              {code.map((digit, index) => (
                <OTPInput
                  key={index}
                  ref={inputRefs[index]}
                  digit={digit}
                  isFocused={focusedIndex === index}
                  onChangeText={(text) => handleChangeText(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                />
              ))}
            </View>

            {/* VERIFY BUTTON */}
            <TouchableOpacity
              style={[styles.verifyBtn, { backgroundColor: isComplete ? COLORS.primary : '#93C5FD' }]}
              disabled={!isComplete}
              onPress={() => router.replace('(onboarding)/step1-identity')}>
              <Text style={styles.verifyText}>Verify and Continue</Text>
            </TouchableOpacity>

            {/* RESEND */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>Didn&apos;t receive the code?</Text>
              <TouchableOpacity>
                <Text style={styles.resendLink}>Resend Code in 0:59</Text>
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

  // Header
  header: { marginBottom: 40, alignItems: 'center' },
  iconCircle: {
    marginBottom: 8,
    height: 64,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: COLORS.primary,
  },
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
  phone: { fontWeight: '600', color: '#111827' },

  // OTP grid
  otpRow: {
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otpBox: {
    height: 48,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
  },
  otpBoxActive: { borderColor: COLORS.primary, backgroundColor: '#fff' },
  otpBoxInactive: { borderColor: '#F3F4F6', backgroundColor: '#F9FAFB' },
  otpInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    padding: 0,
    margin: 0,
  },

  // Button
  verifyBtn: { marginBottom: 32, alignItems: 'center', borderRadius: 16, paddingVertical: 16 },
  verifyText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Resend
  resendRow: { marginTop: 'auto', alignItems: 'center', gap: 8, paddingBottom: 32 },
  resendLabel: { fontWeight: '500', color: '#9CA3AF' },
  resendLink: { fontWeight: '700', color: COLORS.primary },
});
