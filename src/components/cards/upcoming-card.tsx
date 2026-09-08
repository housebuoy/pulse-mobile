import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface UpcomingAppointmentCardProps {
  hospitalName: string;
  doctorName: string;
  department: string;
  date: string; // e.g., "Oct 28, 2026"
  time: string; // e.g., "09:00 AM"
  reference?: string; // e.g., APT-0049
  paymentStatus?: string; // pending | paid | failed | refunded
}

// Solid chip colors read clearly on the gradient cover.
function PaymentChip({ status }: { status: string }) {
  const cfg =
    status === 'paid'
      ? { bg: '#DCFCE7', fg: '#16A34A', label: 'Paid', icon: 'checkmark-circle' as const }
      : status === 'failed'
        ? { bg: '#FEE2E2', fg: '#DC2626', label: 'Payment failed', icon: 'alert-circle' as const }
        : status === 'refunded'
          ? { bg: '#E5E7EB', fg: '#4B5563', label: 'Refunded', icon: 'return-down-back' as const }
          : { bg: '#FEF3C7', fg: '#B45309', label: 'Payment pending', icon: 'time' as const };
  return (
    <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={11} color={cfg.fg} />
      <Text style={[styles.statusChipText, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
}

/**
 * Home hero "cover" — full-bleed gradient, oversized watermark and a bottom
 * scrim so the white content stays legible (matches the web carousel guide:
 * image card + fade + overlaid content + dots).
 */
export default function UpcomingAppointmentCard({
  hospitalName,
  doctorName,
  department,
  date,
  time,
  reference,
  paymentStatus,
}: UpcomingAppointmentCardProps) {
  const [month, dayRaw] = date.split(' ');
  const day = (dayRaw ?? '').replace(',', '');

  return (
    <View style={styles.cardShadow}>
      <LinearGradient
        colors={['#2a79e9', '#1d4ed8', '#1729a8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        {/* Oversized watermark */}
        <Ionicons
          name="calendar"
          size={150}
          color="rgba(255,255,255,0.07)"
          style={styles.watermark}
        />
        {/* Bottom scrim for legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(2,6,23,0.28)']}
          style={styles.scrim}
        />

        {/* Top row: label pill + payment chip */}
        <View style={styles.topRow}>
          <View style={styles.pill}>
            <Ionicons name="calendar" size={12} color="#fff" />
            <Text style={styles.pillText}>UPCOMING VISIT</Text>
          </View>
          {paymentStatus ? <PaymentChip status={paymentStatus} /> : null}
        </View>

        {/* Identity */}
        <Text style={styles.hospitalName} numberOfLines={1}>
          {hospitalName || 'Pulse Health Facility'}
        </Text>
        <Text style={styles.doctorInfo} numberOfLines={1}>
          {department} • {doctorName}
        </Text>

        {reference ? (
          <View style={styles.referenceChip}>
            <Ionicons name="receipt-outline" size={11} color="#fff" />
            <Text style={styles.referenceText}>{reference}</Text>
          </View>
        ) : null}

        {/* Bottom: when + check-in hint */}
        <View style={styles.bottomRow}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateMonth}>{month}</Text>
            <Text style={styles.dateDay}>{day}</Text>
          </View>
          <View style={styles.timeCol}>
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.timeSubtext}>Digital check-in opens 30 mins before</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: -30,
    bottom: -28,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 96,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 4,
  },
  pillText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusChipText: { fontSize: 10, fontWeight: '800' },
  hospitalName: { fontSize: 21, fontWeight: '800', color: '#fff', marginBottom: 3 },
  doctorInfo: { fontSize: 13, color: 'rgba(255,255,255,0.78)', fontWeight: '600' },
  referenceChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    marginTop: 8,
  },
  referenceText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  dateBlock: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 62,
  },
  dateMonth: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  dateDay: { color: '#fff', fontSize: 26, fontWeight: '900', lineHeight: 30 },
  timeCol: { flex: 1 },
  timeText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  timeSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: '500', marginTop: 2 },
});
