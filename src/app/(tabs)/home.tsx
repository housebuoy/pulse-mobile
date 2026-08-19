import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

// Import our Lego Blocks!
import LiveQueueCard from '../../components/cards/live-queue-card';
import SectionHeader from '../../components/shared/section-header';
import VisitHistoryCard from '../../components/cards/visit-history';
import HealthTipBanner from '../../components/cards/health-tip-banner';
import DiscoveryCard from '@/components/cards/discovery-card';
import UpcomingAppointmentCard from '@/components/cards/upcoming-card';
import IconButton from '@/components/ui/header-badge';
import { useQueueStore } from '@/stores/queue-store';
import { useProfileStore } from '@/stores/profile-store';

export default function HomeScreen() {
  const router = useRouter();
  const ticket = useQueueStore((state) => state.ticket);
  const setTicket = useQueueStore((state) => state.setTicket);
  const identity = useProfileStore((state) => state.identity);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const { getMyTicket } = await import('@/lib/api/queue');
        const next = await getMyTicket();
        if (!cancelled && next) setTicket(next);
      } catch {
        /* keep last */
      }
    };
    void poll();
    const id = setInterval(poll, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [setTicket]);
  
  // Toggle this state ('live' | 'upcoming' | 'empty') to test your different layouts
  const [patientStatus, setPatientStatus] = useState<'live' | 'upcoming' | 'empty'>('live');

  // Dummy upcoming appointment data
  const appointment = {
    hospitalName: 'KNUST University Hospital',
    department: 'General OPD',
    doctorName: 'Dr. Arhin',
    date: 'Oct 28, 2026',
    time: '09:00 AM'
  };

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- TOP HEADER (Greeting & Bell) --- */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingText}>{greeting},</Text>
          <Text style={styles.nameText}>{identity?.firstName ?? 'Kwame'}</Text>
        </View>
        <IconButton
          icon="notifications-outline"
          badge={true}
          // onPress={() => router.push('/notifications')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- 1. THE HERO SECTION (Conditionally Rendered) --- */}
        <View style={styles.heroSection}>
          {patientStatus === 'live' && (
            <LiveQueueCard
              variant="home"
              hospitalName={ticket.hospitalName}
              department={ticket.department}
              doctorName={ticket.doctorName}
              waitTimeMins={ticket.waitTimeMins}
              currentNumber={ticket.currentNumber}
              userNumber={ticket.userNumber}
              estimatedTime={ticket.estimatedTime}
              // onViewDetails={() => router.push('/(tabs)/queue')}
            />
          )}

          {patientStatus === 'upcoming' && (
            <UpcomingAppointmentCard {...appointment} />
          )}

          {patientStatus === 'empty' && (
            <DiscoveryCard onBook={() => router.push('/(tabs)/book-appointment')} />
          )}
        </View>

        {/* --- 2. QUICK ACTION PILLS (Horizontal Row) --- */}
        <View style={styles.sectionSpacing}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.pillContainer}
          >
            <TouchableOpacity style={styles.actionPill}>
              <Ionicons name="flask-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionPillText}>Lab Results</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill}>
              <Ionicons name="medical-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionPillText}>Prescriptions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionPill}>
              <Ionicons name="card-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionPillText}>Pay Bill</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* --- 3. RECENT VISITS --- */}
        <View style={styles.sectionSpacing}>
          <SectionHeader
            title="Recent Visits"
            iconName="time-outline"
            actionText="See All"
            onActionPress={() => {}}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}>
            <VisitHistoryCard
              date="Oct 24"
              title="Cardiology Checkup"
              doctorName="Dr. Mensah"
              room="Room 302"
              iconName="pulse"
              iconColor={COLORS.primary}
              iconBgColor="#EFF6FF"
            />
            <VisitHistoryCard
              date="Sep 12"
              title="General Vaccination"
              doctorName="Nurse Abena"
              room="OPD 1"
              iconName="medical"
              iconColor="#16A34A"
              iconBgColor="#DCFCE7"
            />
          </ScrollView>
        </View>

        {/* --- 4. HEALTH TIP BANNER --- */}
        <View style={styles.sectionSpacing}>
          <HealthTipBanner
            category="HEALTH TIP"
            title="Stay hydrated during the harmattan season."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 15,
  },
  greetingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 0,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  heroSection: {
    // Ensures spacing below the hero card regardless of which one renders
    marginBottom: 20,
  },
  
  // --- New Pill Styles ---
  pillContainer: {
    gap: 12, // Requires RN 0.71+, adds space between horizontal items
    paddingRight: 24, // Ensures the last pill doesn't cut off at the edge of the screen
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  actionPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  sectionSpacing: {
    marginBottom: 32,
  },
  horizontalScroll: {
    overflow: 'visible',
    gap: 16,
  },
});