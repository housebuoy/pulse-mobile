import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface UpcomingAppointmentCardProps {
  hospitalName: string;
  doctorName: string;
  department: string;
  date: string; // e.g., "Oct 28, 2026"
  time: string; // e.g., "09:00 AM"
}

export default function UpcomingAppointmentCard({ hospitalName, doctorName, department, date, time }: UpcomingAppointmentCardProps) {
  return (
    <View style={styles.card}>
      {/* --- TOP TICKET SECTION (Vibrant) --- */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View style={styles.pill}>
            <Ionicons name="calendar" size={12} color={COLORS.primary} />
            <Text style={styles.pillText}>UPCOMING VISIT</Text>
          </View>
        </View>
        
        <Text style={styles.hospitalName} numberOfLines={1}>{hospitalName}</Text>
        <Text style={styles.doctorInfo}>{department} • {doctorName}</Text>
      </View>

      {/* --- TICKET DIVIDER --- */}
      <View style={styles.dividerContainer}>
        {/* <View style={styles.notchLeft} /> */}
        <View style={styles.dashedLine} />
        {/* <View style={styles.notchRight} /> */}
      </View>

      {/* --- BOTTOM SECTION (Details) --- */}
      <View style={styles.bottomSection}>
        <View style={styles.timeBlock}>
          <View style={styles.dateBox}>
            <Text style={styles.dateMonth}>{date.split(' ')[0]}</Text>
            <Text style={styles.dateDay}>{date.split(' ')[1].replace(',', '')}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.timeSubtext}>Expected Arrival</Text>
          </View>
        </View>
        
        <View style={styles.footerInfo}>
          <Ionicons name="scan-outline" size={16} color={COLORS.primary} />
          <Text style={styles.footerText}>Digital check-in opens 30 mins before</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  
  // Top Colored Section
  topSection: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  headerRow: { marginBottom: 12, alignItems: 'flex-start' },
  pill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 999, 
    gap: 4 
  },
  pillText: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  hospitalName: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  doctorInfo: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  // Ticket Divider Effect
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 20,
    position: 'relative',
    zIndex: 1,
  },
  notchLeft: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FAFAFA', // Matches your home screen background
    position: 'absolute',
    left: -10,
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    position: 'absolute',
    right: -10,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 15,
  },

  // Bottom Section
  bottomSection: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  timeBlock: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    marginBottom: 16 
  },
  dateBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  dateMonth: { color: COLORS.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  dateDay: { color: COLORS.primary, fontSize: 24, fontWeight: '900' },
  timeInfo: { flex: 1 },
  timeText: { fontSize: 18, fontWeight: '800', color: '#111827' },
  timeSubtext: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  
  footerInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8, 
    backgroundColor: '#F9FAFB', 
    padding: 12, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  footerText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
});