import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
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
  // Expandable manage mode: tapping the card smoothly extends the SAME card
  // surface downward to reveal Reschedule (+ Cancel while unpaid). Kept inside
  // the gradient so the reveal reads as the card growing, not a panel below.
  expanded?: boolean;
  showCancel?: boolean;
  onPress?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
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
 * image card + fade + overlaid content + dots). Memoized: hero pages re-render
 * every 10s poll and this card must not when its display props are unchanged.
 *
 * In manage mode the actions live INSIDE the gradient (after the date/time
 * block) and their container height animates, so the card itself extends
 * smoothly downward — no fixed card height, no detached sibling panel.
 */
function UpcomingAppointmentCard({
  hospitalName,
  doctorName,
  department,
  date,
  time,
  reference,
  paymentStatus,
  expanded = false,
  showCancel = false,
  onPress,
  onReschedule,
  onCancel,
}: UpcomingAppointmentCardProps) {
  const [month, dayRaw] = date.split(' ');
  const day = (dayRaw ?? '').replace(',', '');

  // Layout animation (non-native driver: animating maxHeight is a layout prop).
  const [actionsReveal] = useState(() => new Animated.Value(expanded ? 1 : 0));
  useEffect(() => {
    Animated.timing(actionsReveal, {
      toValue: expanded ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [expanded, actionsReveal]);

  const actionsHeight = actionsReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 132],
    extrapolate: 'clamp',
  });

  const manage = Boolean(onPress || onReschedule || onCancel);

  const cardBody = (
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
      <LinearGradient colors={['transparent', 'rgba(2,6,23,0.28)']} style={styles.scrim} />

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

      {/* Manage actions — revealed inside the same card surface */}
      {manage ? (
        <Animated.View style={{ maxHeight: actionsHeight, overflow: 'hidden' }}>
          <View style={styles.actionsDivider} />
          <Pressable
            onPress={onReschedule}
            style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
            accessibilityRole="button"
            accessibilityLabel="Reschedule appointment">
            <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionPrimaryText}>Reschedule</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.85)" />
          </Pressable>
          {showCancel ? (
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
              accessibilityRole="button"
              accessibilityLabel="Cancel appointment">
              <Ionicons name="close-circle-outline" size={18} color="#FECACA" />
              <Text style={styles.actionCancelText}>Cancel appointment</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(254,202,202,0.85)" />
            </Pressable>
          ) : null}
        </Animated.View>
      ) : null}
    </LinearGradient>
  );

  if (!manage) {
    return <View style={styles.cardShadow}>{cardBody}</View>;
  }

  return (
    <View style={styles.cardShadow}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Manage booking"
        accessibilityState={{ expanded }}>
        {cardBody}
      </Pressable>
    </View>
  );
}

export default React.memo(UpcomingAppointmentCard);

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
  actionsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: 16,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  actionRowPressed: { backgroundColor: 'rgba(255,255,255,0.10)' },
  actionPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', flex: 1 },
  actionCancelText: { color: '#FECACA', fontSize: 15, fontWeight: '700', flex: 1 },
});
