import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface LiveQueueCardProps {
  // Variant controls which screen layout is used
  variant: 'home' | 'queue';

  // Shared data
  hospitalName: string;
  department: string;
  doctorName: string;
  waitTimeMins: number;
  currentNumber: number;
  userNumber: number;

  // Home variant
  estimatedTime?: string;
  onViewDetails?: () => void;

  // Queue variant
  roomNumber?: string;
  onArrived?: () => void;
  onCancel?: () => void;
  onQRPress?: () => void;
}

export default function LiveQueueCard({
  variant,
  hospitalName,
  department,
  doctorName,
  waitTimeMins,
  currentNumber,
  userNumber,
  estimatedTime,
  roomNumber,
  onViewDetails,
  onArrived,
  onCancel,
  onQRPress,
}: LiveQueueCardProps) {
  const patientsAhead = userNumber - currentNumber;
  const progressPercentage = Math.min((currentNumber / userNumber) * 100, 100);
  const isHome = variant === 'home';

  return (
    <View style={styles.card}>

      {/* ── TOP ROW: Live pill + wait time or QR ── */}
      <View style={styles.headerRow}>
        <View style={styles.livePill}>
          <Ionicons name="play-circle-outline" size={14} color="#fff" />
          <Text style={styles.liveText}>LIVE QUEUE</Text>
        </View>

        {/* Home: large wait time number */}
        {isHome && (
          <View style={styles.waitBadge}>
            <Text style={styles.waitNumber}>{waitTimeMins}</Text>
            <Text style={styles.waitLabel}>min wait</Text>
          </View>
        )}

        {/* Queue: QR code button */}
        {!isHome && (
          <TouchableOpacity style={styles.qrBtn} onPress={onQRPress}>
            <Ionicons name="qr-code-outline" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── HOSPITAL INFO ── */}
      <Text style={styles.hospitalName}>{hospitalName}</Text>
      <Text style={styles.doctorInfo}>{department} • {doctorName}</Text>

      {/* ── NUMBERS — different layout per variant ── */}
      {isHome ? (
        // Home: both numbers side by side, equal weight, large labels above
        <View style={styles.numbersRowHome}>
          <View>
            <Text style={styles.numberLabelHome}>NOW SERVING</Text>
            <Text style={styles.numberValueHome}>#{currentNumber}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.numberLabelHome}>YOUR NUMBER</Text>
            <Text style={styles.numberValueHome}>#{userNumber}</Text>
          </View>
        </View>
      ) : (
        // Queue: now serving is small/secondary, your number is massive and dominant
        <View style={styles.numbersRowQueue}>
          <View style={styles.nowServingBlock}>
            <Text style={styles.nowServingLabel}>NOW SERVING</Text>
            <Text style={styles.nowServingValue}>#{currentNumber}</Text>
          </View>
          <View style={styles.yourNumberBlock}>
            <Text style={styles.yourNumberLabel}>YOUR NUMBER</Text>
            <Text style={styles.yourNumberValue}>#{userNumber}</Text>
          </View>
        </View>
      )}

      {/* ── PROGRESS BAR ── */}
      {isHome && (
        <View style={styles.progressMeta}>
          {/* <Text style={styles.progressLabel} /> */}
          {/* <Text style={styles.progressLabel}>{patientsAhead} patients ahead of you</Text> */}
        </View>
      )}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
      </View>
      {!isHome && (
        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>Progress</Text>
          {/* <Text style={styles.progressLabel}>{patientsAhead} patients ahead</Text> */}
        </View>
      )}

      {/* ── DETAIL BOX — queue only ── */}
      {!isHome && (
        <View style={styles.detailBox}>
          <View style={styles.detailRow}>
            <Ionicons name="timer-outline" size={16} color="#93C5FD" />
            <Text style={styles.detailText}>
              Estimated Wait:{' '}
              <Text style={styles.detailBold}>~{waitTimeMins} mins</Text>
            </Text>
          </View>
          {roomNumber && (
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={16} color="#93C5FD" />
              <Text style={styles.detailText}>
                Proceed to{' '}
                <Text style={[styles.detailBold, styles.detailUnderline]}>
                  Room {roomNumber}
                </Text>{' '}
                when called
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── HOME: patients ahead + view details ── */}
      {isHome && (
        <>
          {estimatedTime && (
            <Text style={styles.estText}>
              {patientsAhead} patients ahead of you (Est. {estimatedTime})
            </Text>
          )}
          <TouchableOpacity style={styles.viewDetailsBtn} onPress={onViewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </>
      )}

      {/* ── QUEUE: arrived + cancel ── */}
      {!isHome && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.arrivedBtn} onPress={onArrived}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.arrivedText}>I have arrived</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 24,
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

  // Wait badge (home)
  waitBadge: { alignItems: 'flex-end' },
  waitNumber: { color: '#fff', fontSize: 26, fontWeight: '800', lineHeight: 30 },
  waitLabel: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '500' },

  // QR button (queue)
  qrBtn: {
    width: 40, height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hospital info
  hospitalName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 3 },
  doctorInfo: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '500', marginBottom: 10 },

  // ── HOME numbers: side by side, equal, labels above ──
  numbersRowHome: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 0,
  },
  numberLabelHome: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  numberValueHome: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
  },

  // ── QUEUE numbers: now serving small left, your number massive right ──
  numbersRowQueue: {
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

  // Progress
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
  },
  progressLabel: { color: COLORS.primaryLight, fontSize: 11, fontWeight: '500' },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 999,
    marginBottom: 4,
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },

  // Detail box (queue)
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

  // Est text (home)
  estText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16,
    marginTop: 4,
  },

  // View Details (home)
  viewDetailsBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  viewDetailsText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },

  // Arrived / Cancel (queue)
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  arrivedBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14,
  },
  arrivedText: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  cancelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14,
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: COLORS.danger },
});