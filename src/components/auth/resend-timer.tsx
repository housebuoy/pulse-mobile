import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface ResendTimerProps {
  /** Called when the user taps "Resend Code" after the countdown ends.
   *  Return a promise; the timer restarts once it resolves. */
  onResend: () => void | Promise<void>;
  /** Countdown length in seconds (default 59). */
  seconds?: number;
  /** Label before the link. */
  label?: string;
}

export default function ResendTimer({
  onResend,
  seconds = 59,
  label = "Didn't receive the code?",
}: ResendTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const canResend = secondsLeft <= 0 && !busy;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePress = useCallback(async () => {
    if (!canResend) return;
    setBusy(true);
    try {
      await onResend();
      setSecondsLeft(seconds); // restart countdown after a successful resend
    } catch {
      // parent handles surfacing the error; leave timer at 0 so they can retry
    } finally {
      setBusy(false);
    }
  }, [canResend, onResend, seconds]);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity onPress={handlePress} disabled={!canResend}>
        <Text style={[styles.link, !canResend && styles.linkDisabled]}>
          {busy
            ? 'Sending…'
            : canResend
              ? 'Resend Code'
              : `Resend Code in ${formatTime(secondsLeft)}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 'auto',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 32,
  },
  label: { fontWeight: '500', color: '#9CA3AF' },
  link: { fontWeight: '700', color: COLORS.primary },
  linkDisabled: { color: '#9CA3AF' },
});