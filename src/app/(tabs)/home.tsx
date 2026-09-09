import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
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
import { selectUnreadCount, useNotificationsStore } from '@/stores/notifications-store';
import { getAppointments } from '@/lib/api/appointments';
import type { PatientAppointment } from '@/lib/api/appointments';
import { getMyTicket } from '@/lib/api/queue';
import type { QueueTicket } from '@/stores/queue-store';

const UPCOMING_STATUSES = new Set(['scheduled', 'confirmed', 'checked_in']);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-09-12T08:40" (or with Z) → { date: 'Sep 12, 2026', time: '08:40 AM' }
function fmtWhen(iso: string): { date: string; time: string } {
  const [d, t] = iso.split('T');
  if (!d) return { date: iso, time: '' };
  const [y, m, day] = d.split('-').map(Number);
  const date = `${MONTHS[(m ?? 1) - 1]} ${day}, ${y}`;
  if (!t) return { date, time: '' };
  const [hhStr, mmStr] = t.split(':');
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return { date, time: `${h12}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}` };
}

type HeroPage =
  | { kind: 'booking'; booking: PatientAppointment }
  | { kind: 'live'; ticket: QueueTicket };

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = width - 48; // matches ScrollView paddingHorizontal 24
  const ticket = useQueueStore((state) => state.ticket);
  const setTicket = useQueueStore((state) => state.setTicket);
  const clearTicket = useQueueStore((state) => state.clearTicket);
  const identity = useProfileStore((state) => state.identity);
  const unreadNotifications = useNotificationsStore(selectUnreadCount);
  const syncUnreadCount = useNotificationsStore((state) => state.syncUnreadCount);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const refreshing = useRef(false);
  const heroListRef = useRef<FlatList<HeroPage>>(null);
  // Timestamp of the last manual swipe — autoplay backs off right after so it
  // never fights the user's finger.
  const lastDragAt = useRef(0);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      // Bookings list + live ticket in one round so the hero carousel and the
      // live-queue block always agree with each other.
      const [bookings, myTicket] = await Promise.all([
        getAppointments().catch(() => null), // keep last list on failure
        getMyTicket().catch(() => null), // null on 404 (no active queue)
      ]);
      if (bookings) setAppointments(bookings);
      if (myTicket) setTicket(myTicket);
      else clearTicket();
    } finally {
      refreshing.current = false;
    }
  }, [setTicket, clearTicket]);

  // Keep the bell badge in sync with the backend unread count — on mount AND
  // on every Home focus, so returning from other tabs/screens refreshes the
  // badge without an app restart.
  useFocusEffect(
    useCallback(() => {
      void syncUnreadCount();
      void refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syncUnreadCount])
  );

  // Poll every 10s (ticket + upcoming bookings) so Home stays live while open.
  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 10000);
    return () => clearInterval(id);
  }, [refresh]);

  // Hero pages: every upcoming booking, ordered soonest-first. A booking that
  // has an active queue ticket renders the live queue card instead of the
  // plain upcoming card. A ticket with no matching booking (walk-in / seeded)
  // still gets its own page so the patient never loses their ticket.
  const pages = useMemo<HeroPage[]>(() => {
    const upcoming = appointments
      .filter((a) => UPCOMING_STATUSES.has(a.status))
      .sort((a, b) => (a.scheduledAt < b.scheduledAt ? -1 : 1));
    const liveId =
      typeof ticket?.bookingId === 'number' ? String(ticket.bookingId) : null;
    const ticketActive = Boolean(ticket?.hospitalName);

    const result: HeroPage[] = [];
    let matchedLive = false;
    for (const booking of upcoming) {
      const isLive = liveId !== null && liveId === booking.id;
      if (isLive) matchedLive = true;
      result.push(
        isLive
          ? { kind: 'live', ticket }
          : { kind: 'booking', booking }
      );
    }
    if (ticketActive && !matchedLive) {
      result.unshift({ kind: 'live', ticket });
    }
    return result;
  }, [appointments, ticket]);

  // Clamp the carousel position when the page list shrinks (no setState-in-effect).
  const shownIndex = pages.length === 0 ? 0 : Math.min(heroIndex, pages.length - 1);

  // Guide-style gentle auto-advance: every 5s move to the next page, but back
  // off for a few seconds after a manual swipe so autoplay never yanks the
  // carousel out from under the user's finger.
  useEffect(() => {
    if (pages.length <= 1) return;
    const id = setInterval(() => {
      if (Date.now() - lastDragAt.current < 6000) return;
      const next = (shownIndex + 1) % pages.length;
      heroListRef.current?.scrollToOffset({
        offset: next * cardWidth,
        animated: true,
      });
      setHeroIndex(next);
    }, 5000);
    return () => clearInterval(id);
  }, [pages.length, shownIndex, cardWidth]);

  const getItemLayout = useCallback(
    (_: ArrayLike<HeroPage> | null | undefined, index: number) => ({
      length: cardWidth,
      offset: cardWidth * index,
      index,
    }),
    [cardWidth]
  );

  const onScrollBeginDrag = () => {
    lastDragAt.current = Date.now();
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (idx !== heroIndex) setHeroIndex(idx);
  };

  const renderPage = ({ item }: { item: HeroPage }) => {
    // Each page is exactly one card-width wide; without this the FlatList
    // items shrink-wrap their content and the next card peeks in beside the
    // current one ("stacked together"). Pinning the width makes paging land
    // exactly one card per swipe.
    if (item.kind === 'live') {
      return (
        <View style={{ width: cardWidth }}>
          <LiveQueueCard
            variant="home"
            hospitalName={item.ticket.hospitalName}
            department={item.ticket.department}
            doctorName={item.ticket.doctorName}
            waitTimeMins={item.ticket.waitTimeMins}
            currentNumber={item.ticket.currentNumber}
            userNumber={item.ticket.userNumber}
            estimatedTime={item.ticket.estimatedTime}
            bookingReference={item.ticket.bookingReference}
            queueTotal={item.ticket.queueTotal}
            aheadCount={item.ticket.aheadCount}
            servedCount={item.ticket.servedCount}
            onViewDetails={() => router.push('/(tabs)/queue')}
          />
        </View>
      );
    }
    const when = fmtWhen(item.booking.scheduledAt);
    return (
      <View style={{ width: cardWidth }}>
        <UpcomingAppointmentCard
          hospitalName={item.booking.hospitalName ?? ''}
          department={item.booking.departmentName}
          doctorName={item.booking.doctorName}
          date={when.date}
          time={when.time}
          reference={item.booking.reference}
          paymentStatus={item.booking.paymentStatus}
        />
      </View>
    );
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
          badge={unreadNotifications > 0}
          onPress={() => router.push('/(screens)/notifications')}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* --- 1. THE HERO SECTION (booking carousel) --- */}
        <View style={styles.heroSection}>
          {pages.length > 0 ? (
            <>
              <FlatList
                ref={heroListRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={pages}
                keyExtractor={(item, i) =>
                  item.kind === 'live' ? `live-${i}` : `booking-${item.booking.id}`
                }
                renderItem={renderPage}
                snapToInterval={cardWidth}
                decelerationRate="fast"
                getItemLayout={getItemLayout}
                onScrollBeginDrag={onScrollBeginDrag}
                onMomentumScrollEnd={onScrollEnd}
                style={{ width: cardWidth }}
              />
              {pages.length > 1 && (
                <View style={styles.dotsRow}>
                  {pages.map((p, i) => (
                    <TouchableOpacity
                      key={p.kind === 'live' ? `dot-live-${i}` : `dot-${p.booking.id}`}
                      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                      onPress={() => {
                        lastDragAt.current = Date.now();
                        heroListRef.current?.scrollToOffset({
                          offset: i * cardWidth,
                          animated: true,
                        });
                        setHeroIndex(i);
                      }}
                      style={[styles.dot, i === shownIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
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
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => router.push('/(screens)/my-appointments')}
              activeOpacity={0.7}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionPillText}>My Appointments</Text>
            </TouchableOpacity>

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
            onActionPress={() => router.push('/(tabs)/records')}
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
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 18,
    backgroundColor: COLORS.primary,
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
