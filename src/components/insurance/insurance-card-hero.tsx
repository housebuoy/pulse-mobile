import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, isBefore, parseISO, startOfDay } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { useInsuranceStore } from '@/stores/insurance-store';

type ExpiryStatus = 'active' | 'expired' | null;

// Pure date comparison — today vs. the expiry the patient entered. This
// pill never claims coverage for a service or checks eligibility with a
// provider; it only reflects whether the recorded date has passed.
function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return null;
  try {
    const expiry = startOfDay(parseISO(expiryDate));
    const today = startOfDay(new Date());
    return isBefore(expiry, today) ? 'expired' : 'active';
  } catch {
    return null;
  }
}

export default function InsuranceCardHero() {
  const scheme = useInsuranceStore((state) => state.scheme);
  const membershipNumber = useInsuranceStore((state) => state.membershipNumber);
  const cardholderName = useInsuranceStore((state) => state.cardholderName);
  const expiryDate = useInsuranceStore((state) => state.expiryDate);

  const status = getExpiryStatus(expiryDate);
  const formattedExpiry = (() => {
    if (!expiryDate) return '—';
    try {
      return format(parseISO(expiryDate), 'MMM d, yyyy');
    } catch {
      return expiryDate;
    }
  })();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>HEALTH INSURANCE</Text>
            <Text style={styles.schemeName}>{scheme || 'Not set'}</Text>
          </View>
          {status && (
            <View
              style={[
                styles.statusPill,
                status === 'active' ? styles.statusPillActive : styles.statusPillExpired,
              ]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: status === 'active' ? COLORS.success : COLORS.danger },
                ]}
              />
              <Text style={styles.statusPillText}>{status === 'active' ? 'Active' : 'Expired'}</Text>
            </View>
          )}
        </View>

        <View style={styles.numberBlock}>
          <Text style={styles.numberLabel}>Membership No.</Text>
          <Text style={styles.numberValue}>{membershipNumber || '—'}</Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.bottomField}>
            <Text style={styles.bottomLabel}>Cardholder</Text>
            <Text style={styles.bottomValue}>{cardholderName || '—'}</Text>
          </View>
          <View style={[styles.bottomField, { alignItems: 'flex-end' }]}>
            <Text style={styles.bottomLabel}>Expires</Text>
            <Text style={styles.bottomValue}>{formattedExpiry}</Text>
          </View>
        </View>

        <Ionicons
          name="shield-checkmark"
          size={100}
          color="rgba(255,255,255,0.08)"
          style={styles.bgIcon}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
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
  schemeName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  statusPillActive: {},
  statusPillExpired: {},
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 12, fontWeight: '700', color: '#111827' },

  numberBlock: { marginBottom: 24 },
  numberLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  numberValue: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: 2 },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bottomField: { flex: 1 },
  bottomLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bottomValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  bgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
});
