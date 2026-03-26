import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';

// Import our Lego Blocks! (Adjust paths based on exactly where you saved them)
import LiveQueueCard from '../../components/cards/live-queue-card';
import SectionHeader from '../../components/shared/section-header';
import QuickActionIcon from '../../components/cards/quick-action';
import VisitHistoryCard from '../../components/cards/visit-history';
import HealthTipBanner from '../../components/cards/health-tip-banner';
import IconButton from '@/components/ui/header-badge';

export default function HomeScreen() {
  const router = useRouter();
  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- TOP HEADER (Greeting & Bell) --- */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingText}>{greeting},</Text>
          <Text style={styles.nameText}>Kwame</Text>
        </View>
        <IconButton
          icon="notifications-outline"
          badge={true}
          // onPress={() => router.push('/notifications')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- 1. LIVE QUEUE HERO CARD --- */}
        <LiveQueueCard
          variant="home"
          hospitalName="KNUST Hospital"
          department="General OPD"
          doctorName="Dr. Arhin"
          waitTimeMins={45}
          currentNumber={4}
          userNumber={12}
          estimatedTime="10:15 AM"
          // onViewDetails={() => router.push('/(tabs)/queue')}
        />

        {/* --- 2. QUICK ACTIONS (Horizontal Row) --- */}
        <SectionHeader title="Quick Actions" iconName="grid-outline" />
        <View style={styles.quickActionsRow}>
          <QuickActionIcon
            iconName="calendar-outline"
            label="Book Slot"
            backgroundColor={COLORS.primaryLight}
            iconColor={COLORS.primary}
            onPress={() => router.replace('/(tabs)/book-appointment')}
          />
          <QuickActionIcon
            iconName="folder-outline"
            label="My Folder"
            backgroundColor="#F3E8FF"
            iconColor="#9333EA"
            onPress={() => {}}
          />
          <QuickActionIcon
            iconName="flask-outline"
            label="Lab Results"
            backgroundColor="#DCFCE7"
            iconColor="#16A34A"
            onPress={() => {}}
          />
          <QuickActionIcon
            iconName="wallet-outline"
            label="Wallets"
            backgroundColor="#FFEDD5"
            iconColor="#EA580C"
            onPress={() => {}}
          />
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
              iconBgColor={COLORS.primaryLight}
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
    backgroundColor: '#FAFAFA', // Slightly off-white background to make cards pop
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
    fontWeight: '800',
    color: '#111827',
  },
  bellIcon: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 999,
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20, // Extra padding so the bottom tab bar doesn't cover the last card
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  sectionSpacing: {
    marginBottom: 32,
  },
  horizontalScroll: {
    overflow: 'visible', // Allows shadows on the cards to not get clipped
  },
});
