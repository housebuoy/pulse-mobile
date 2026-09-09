import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface LiveQueueCardProps {
  // Shared data
  hospitalName: string;
  department: string;
  doctorName: string;
  waitTimeMins: number;
  currentNumber: number;
  userNumber: number;

  // Queue detail extras
  roomNumber?: string;
  onQRPress?: () => void;

  // Live queue position (backend QueueTicketResponse). When absent we fall
  // back to ticket-digit arithmetic (legacy/older backend).
  bookingReference?: string | null;
  queueTotal?: number;
  aheadCount?: number;
  servedCount?: number;
}

/**
 * Live queue status card for the Live Queue page. Display-only by design:
 * arrival/cancel actions live on the page, NOT inside this card.
 */
function LiveQueueCard({
  hospitalName,
  department,
  doctorName,
  waitTimeMins,
  currentNumber,
  userNumber,
  roomNumber,
  onQRPress,
  bookingReference,
  queueTotal,
  aheadCount,
  servedCount,
}: LiveQueueCardProps) {
  const hasPosition =
    typeof aheadCount === 'number' && typeof servedCount === 'number';
  const patientsAhead = hasPosition
    ? aheadCount
    : Math.max(userNumber - currentNumber, 0);
  const progressPercentage = hasPosition
    ? servedCount + aheadCount > 0
      ? Math.min((servedCount / (servedCount + aheadCount)) * 100, 100)
      : 0
    : Math.min((currentNumber / userNumber) * 100, 100);
  const inQueueLabel =
    typeof queueTotal === 'number' && queueTotal > 0
      ? ` · ${queueTotal} in queue`
      : '';

  return (
    <View style={styles.cardWrap}>
      <LinearGradient
        colors={['#2a79e9', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        {/* ── TOP ROW: Live pill + QR ── */}
        <View style={styles.headerRow}>
          <View style={styles.livePill}>
            <Ionicons name="play-circle-outline" size={14} color="#fff" />
            <Text style={styles.liveText}>LIVE QUEUE</Text>
          </View>

          {onQRPress ? (
            <TouchableOpacity style={styles.qrBtn} onPress={onQRPress}>
              <Ionicons name="qr-code-outline" size={22} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── HOSPITAL INFO ── */}
        <Text style={styles.hospitalName} numberOfLines={2} ellipsizeMode="tail">
          {hospitalName}
        </Text>
        <Text style={styles.doctorInfo}>
          {department} • {doctorName}
        </Text>

        {/* ── NUMBERS: now serving small left, your number massive right ── */}
        <View style={styles.numbersRow}>
          <View style={styles.nowServingBlock}>
            <Text style={styles.nowServingLabel}>NOW SERVING</Text>
            <Text style={styles.nowServingValue}>#{currentNumber}</Text>
            {inQueueLabel ? (
              <Text style={styles.numberSub}>{queueTotal} in queue</Text>
            ) : null}
          </View>
          <View style={styles.yourNumberBlock}>
            <Text style={styles.yourNumberLabel}>YOUR NUMBER</Text>
            <Text style={styles.yourNumberValue}>#{userNumber}</Text>
          </View>
        </View>

        {/* ── PROGRESS ── */}
        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>Progress</Text>
          {hasPosition ? (
            <Text style={styles.progressRight}>
              {aheadCount > 0
                ? `${aheadCount} ahead of you`
                : 'your turn is next'}
            </Text>
          ) : null}
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>

        {/* ── DETAIL BOX ── */}
        <View style={styles.detailBox}>
          <View style={styles.detailRow}>
            <Ionicons name="timer-outline" size={16} color="#93C5FD" />
            <Text style={styles.detailText}>
              Estimated Wait: <Text style={styles.detailBold}>~{waitTimeMins} mins</Text>
              {patientsAhead > 0 ? ` (${patientsAhead} ahead of you)` : ''}
            </Text>
          </View>
          {roomNumber ? (
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={16} color="#93C5FD" />
              <Text style={styles.detailText}>
                Proceed to{' '}
                <Text style={[styles.detailBold, styles.detailUnderline]}>Room {roomNumber}</Text>{' '}
                when called
              </Text>
            </View>
          ) : null}
          {bookingReference ? (
            <View style={styles.detailRow}>
              <Ionicons name="receipt-outline" size={16} color="#93C5FD" />
              <Text style={styles.detailText}>
                Booking <Text style={styles.detailBold}>{bookingReference}</Text>
              </Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

export default React.memo(LiveQueueCard);

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: 24,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  // QR button
  qrBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hospital info
  hospitalName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 3 },
  doctorInfo: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '500', marginBottom: 10 },

  // Numbers
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  nowServingBlock: { justifyContent: 'flex-end' },
  nowServingLabel: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    lineHeight: 14,
    marginBottom: 2,
  },
  nowServingValue: {
    color: '#fff',
    fontSize: 50,
    fontWeight: '800',
  },
  yourNumberBlock: { alignItems: 'flex-end' },
  yourNumberLabel: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  yourNumberValue: {
    color: '#fff',
    fontSize: 50,
    fontWeight: '900',
    lineHeight: 68,
  },
  numberSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // Progress
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
  },
  progressLabel: { color: COLORS.primaryLight, fontSize: 11, fontWeight: '500' },
  progressRight: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '600' },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 999,
    marginBottom: 4,
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },

  // Detail box
  detailBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 12,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: '#fff' },
  detailBold: { fontWeight: '700' },
  detailUnderline: { textDecorationLine: 'underline' },
});
