import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import DateStrip from '@/components/book-appointment/date-strip';
import MonthSelector from '@/components/book-appointment/month-selector';
import TimeSlotPicker, { TimeSlot } from '@/components/book-appointment/time-slot-picker';
import AskAiSheet from '@/components/book-appointment/ask-ai-sheet';
import Divider from '@/components/ui/divider';
import Dropdown, { DropdownOption } from '@/components/ui/dropdown-menu';
import type { DepartmentOption } from '@/lib/api/discovery';
// import { DEPARTMENTS } from '@/constants/departments';
import { fetchMockAvailability, HospitalAvailability } from '@/services/mock/hospital-schedule';
import { useBookingStore } from '@/stores/booking-store';
import { useHospitalsStore } from '@/stores/hospitals-store';

// const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 280; // Total height of the image area

const { width } = Dimensions.get('window');

// --- Mock Data ---
const FALLBACK_HOSPITAL = {
  name: 'KNUST University Hospital',
  location: 'University Road, Kumasi',
  rating: 4.8,
  reviews: '120+',
  image:
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=1000&auto=format&fit=crop',
  distance: '2.5 km',
  waitTime: 'Low',
  status: 'Open 24/7',
};

const TODAY_ISO = new Date().toISOString().split('T')[0];

export default function HospitalDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    location?: string;
    distance?: string;
    waitStatus?: string;
    rating?: string;
    reviews?: string;
    imageUrl?: string;
    status?: string;
  }>();

  const HOSPITAL = {
    id: params.id ?? '1',
    name: params.name ?? FALLBACK_HOSPITAL.name,
    location: params.location ?? FALLBACK_HOSPITAL.location,
    rating: params.rating ? Number(params.rating) : FALLBACK_HOSPITAL.rating,
    reviews: params.reviews ?? FALLBACK_HOSPITAL.reviews,
    image: params.imageUrl ?? FALLBACK_HOSPITAL.image,
    distance: params.distance ?? FALLBACK_HOSPITAL.distance,
    waitTime: params.waitStatus ?? FALLBACK_HOSPITAL.waitTime,
    status: params.status ?? FALLBACK_HOSPITAL.status,
  };

  // --- Booking selection now lives in the shared booking store, so it
  // survives navigating away and back (and app reloads). ---
  const department = useBookingStore((state) => state.department);
  const selectedDate = useBookingStore((state) => state.selectedDate) ?? TODAY_ISO;
  const selectedTime = useBookingStore((state) => state.selectedTime);
  const setFacility = useBookingStore((state) => state.setFacility);
  const setDepartment = useBookingStore((state) => state.setDepartment);
  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);
  const setSelectedTime = useBookingStore((state) => state.setSelectedTime);
  const setLastBookingId = useBookingStore((state) => state.setLastBookingId);

  const [deptOptions, setDeptOptions] = useState<DropdownOption[]>([]);
  const [deptMap, setDeptMap] = useState<Record<string, number>>({});
  const [deptDoctors, setDeptDoctors] = useState<Record<string, boolean>>({});
  

  const isSaved = useHospitalsStore((state) => 
    state.savedHospitalIds.includes(params.id as string)
  );
  const toggleSaved = useHospitalsStore((state) => state.toggleSaved);

  const [askAiVisible, setAskAiVisible] = useState(false);

  useEffect(() => {
    // Fresh booking session per hospital: the store persists in AsyncStorage,
    // so a stale department/date from a previous hospital (e.g. Korle Bu) could
    // otherwise leak into a KNUST booking → wrong hospital + wrong fee (FE-23).
    useBookingStore.getState().reset();
    setFacility(HOSPITAL.name, HOSPITAL.location, HOSPITAL.id);
  }, [setFacility, HOSPITAL.name, HOSPITAL.location, HOSPITAL.id]);

  useEffect(() => {
    import('@/lib/api/discovery').then(({ listDepartments }) =>
      listDepartments(HOSPITAL.id).then((rows: DepartmentOption[]) => {
        setDeptOptions(rows.map((d) => ({ label: d.name, value: String(d.id) })));
        const map: Record<string, number> = {};
        const doctors: Record<string, boolean> = {};
        rows.forEach((d) => {
          map[String(d.id)] = d.id;
          doctors[String(d.id)] = d.hasDoctors !== false;
        });
        setDeptMap(map);
        setDeptDoctors(doctors);
      })
    );
  }, [HOSPITAL.id]);

  // --- Calendar cursor (which month is displayed) stays local UI state ---
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  // --- Availability now comes from the shared mock service instead of a
  // hardcoded literal, so this screen and Reschedule read the same source. ---
  const [availability, setAvailability] = useState<HospitalAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingAvailability(true);
    // Fetch from today (DateStrip offers today + 14 days). Previously this
    // used the 1st of the displayed month, so the Aug 1-14 window never
    // overlapped the selectable dates → "no available slots" (bug-triage FE-13).
    const now = new Date();
    const from = new Date(Math.max(currentMonth.getTime(), now.getTime()))
      .toISOString()
      .split('T')[0];
    const deptId = department && deptMap[department] ? deptMap[department] : department;
    // No department selected yet — don't fetch (HOSPITAL.id is not a valid
    // department id; fetching it 400s and leaves the spinner stuck).
    if (!deptId) {
      setLoadingAvailability(false);
      return () => {
        cancelled = true;
      };
    }
    import('@/lib/api/discovery').then(({ getAvailability }) =>
      getAvailability(deptId, from, 14)
        .then((data) => {
          if (!cancelled) {
            setAvailability(data);
            setLoadingAvailability(false);
          }
        })
        .catch(() => {
          if (!cancelled) setLoadingAvailability(false);
        })
    );
    return () => {
      cancelled = true;
    };
  }, [currentMonth, department, deptMap, HOSPITAL.id]);

  const daySlots = availability?.slots[selectedDate];
  const flatSlots: TimeSlot[] = daySlots ? [...daySlots.MORNING, ...daySlots.AFTERNOON] : [];

  // --- Animation Value ---
  const scrollY = useRef(new Animated.Value(0)).current;

  // Optional: Add a slight parallax effect so the image scrolls up slower than the sheet
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 3],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* 1. BACKGROUND HERO IMAGE (Fixed at the back) */}
      <Animated.View
        style={[styles.heroImageContainer, { transform: [{ translateY: imageTranslateY }] }]}>
        <ImageBackground source={{ uri: HOSPITAL.image }} style={styles.heroImage} />
      </Animated.View>

      {/* 2. FLOATING HEADER BUTTONS (Always on top) */}
      <SafeAreaView edges={['top']} style={styles.headerButtonsRow} pointerEvents="box-none">
        <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.circleButton, isSaved && styles.circleButtonActive]}
          onPress={() => toggleSaved(params.id as string)}
          activeOpacity={0.8}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? COLORS.primary : '#FFFFFF'}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* 3. THE SCROLLABLE SHEET */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16} // Captures scroll smoothly
        contentContainerStyle={styles.scrollContent}>
        <View style={{ height: HEADER_HEIGHT - 40 }} />
        {/* 1. Title & Rating Row */}
        <View style={styles.bottomSheet}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.hospitalName}>{HOSPITAL.name}</Text>
              <Text style={styles.locationText}>{HOSPITAL.location}</Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>View facility details {'>'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#EAB308" />
                <Text style={styles.ratingNumber}>{HOSPITAL.rating}</Text>
              </View>
              <Text style={styles.reviewCount}>({HOSPITAL.reviews} reviews)</Text>
            </View>
          </View>

          {/* 2. Metrics Row */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="navigate-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{HOSPITAL.distance}</Text>
            </View>

            <Divider orientation="vertical" height={40} />

            <View style={styles.metricItem}>
              <View style={[styles.metricIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="time-outline" size={20} color="#10B981" />
              </View>
              <Text style={styles.metricLabel}>Wait Time</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{HOSPITAL.waitTime}</Text>
            </View>

            <Divider orientation="vertical" height={40} />

            <View style={styles.metricItem}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="alert-circle-outline" size={20} color="#EA580C" />
              </View>
              <Text style={styles.metricLabel}>Status</Text>
              <Text style={styles.metricValue}>{HOSPITAL.status}</Text>
            </View>
          </View>

          <Divider />

          {/* 3. Department Selector */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>1. Select Department</Text>
            <TouchableOpacity
              style={styles.aiAssistButton}
              onPress={() => setAskAiVisible(true)}
              activeOpacity={0.7}>
              <Text style={styles.aiAssistText}>Not sure? Ask AI ✨</Text>
            </TouchableOpacity>
          </View>

          <Dropdown
            label="Department"
            options={deptOptions}
            selected={department}
            onSelect={(value) => setDepartment(value, deptMap[value] ?? Number(value))}
            placeholder="Select a department"
          />

          {/* 4. Date Selector */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>2. Select Date</Text>
            <MonthSelector
              selectedMonth={currentMonth}
              readOnly={true}
              onMonthChange={(newMonth) => {
                setCurrentMonth(newMonth);
                setSelectedDate(newMonth.toISOString().split('T')[0]);
              }}
            />
          </View>

          <DateStrip
            // currentMonth={currentMonth}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            disabledDates={availability?.closedDates ?? []} // hospital closed days
            unavailableDates={availability?.fullDates ?? []} // all slots taken
          />

          {/* 5. Time Slots */}
          <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>
            Available Slots
          </Text>

          {(() => {
            const deptKey = department ? String(deptMap[department] ?? department) : null;
            const deptHasDoctors = deptKey ? (deptDoctors[deptKey] ?? true) : true;
            if (!deptHasDoctors) {
              return (
                <View style={styles.noDoctorsBox}>
                  <Ionicons name="medkit-outline" size={22} color="#9CA3AF" />
                  <Text style={styles.noDoctorsText}>
                    No doctors are available for this department right now. Please try another
                    department.
                  </Text>
                </View>
              );
            }
            return loadingAvailability ? (
              <View style={styles.loadingSlots}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : (
              <TimeSlotPicker
                slots={flatSlots}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            );
          })()}
        </View>
      </Animated.ScrollView>

      {/* --- STICKY FOOTER --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!selectedDate || !selectedTime || submitting) && styles.proceedButtonDisabled,
          ]}
          disabled={!selectedDate || !selectedTime || submitting}
          onPress={async () => {
            if (submitting) return;
            setSubmitting(true);
            try {
              const { bookMobile } = await import('@/lib/api/discovery');
              const { getOutstanding } = await import('@/lib/api/patient');
              const { usePaymentsStore } = await import('@/stores/payments-store');
              const deptId = useBookingStore.getState().departmentId ?? Number(department);
              const result = await bookMobile(deptId, selectedDate, selectedTime ?? '');
              const id =
                result && typeof result === 'object' && 'id' in result
                  ? String((result as { id: unknown }).id)
                  : null;
              setLastBookingId(id);
              try {
                const outstanding = await getOutstanding();
                usePaymentsStore.getState().hydrateFromApi({ outstanding });
              } catch {
                /* ignore */
              }
              // Confirm the booking with a clear call-to-action instead of
              // silently leaving the page (bug-triage FE-17).
              const fee =
                result && typeof result === 'object' && 'feeAmount' in result
                  ? Number((result as { feeAmount: unknown }).feeAmount)
                  : null;
              const feeLine =
                fee != null && !Number.isNaN(fee)
                  ? `\nPay GH₵ ${fee.toFixed(2)} to secure your slot.`
                  : '';
              Alert.alert(
                'Booking confirmed',
                `Your appointment is booked for ${selectedDate}.${feeLine}`,
                [
                  {
                    text: 'Later',
                    style: 'cancel',
                    onPress: () => router.replace('/(tabs)/home'),
                  },
                  {
                    text: 'Pay Now',
                    onPress: () => router.push('/(screens)/payments'),
                  },
                ]
              );
              setSubmitting(false);
            } catch (e) {
              setSubmitting(false);
              alert(e instanceof Error ? e.message : 'Booking failed');
            }
          }}>
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.proceedButtonText}>Proceed</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <AskAiSheet
        visible={askAiVisible}
        onClose={() => setAskAiVisible(false)}
        onSelectDepartment={(value) => setDepartment(value)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Hero Image (Now Absolute)
  heroImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: '#111827', // Dark fallback while image loads
  },
  heroImage: {
    width: width,
    height: '100%',
  },

  // Floating Header
  headerButtonsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10, // Keeps buttons clickable over the scrollview!
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker so it's visible on bright skies
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonActive: {
    backgroundColor: '#FFFFFF',
  },

  // Scroll Area
  scrollContent: {
    paddingBottom: 120, // Space for footer
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 24,
    minHeight: '100%', // Ensures the white background extends all the way down
  },
  drawerIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  drawerIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 30,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#854D0E',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Metrics Row
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F3F4F6',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 24,
  },

  // Selectors
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  aiAssistButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  aiAssistText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },

  // Time Slots (Reused logic)
  loadingSlots: { paddingVertical: 40, alignItems: 'center' },
  noDoctorsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  noDoctorsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  timeGroup: { marginBottom: 20 },
  periodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timePill: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  timePillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timePillDisabled: { backgroundColor: '#F9FAFB', borderColor: '#F3F4F6' },
  timeText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  timeTextActive: { color: '#FFFFFF' },
  timeTextDisabled: { color: '#D1D5DB' },

  // Sticky Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32, // Accommodate iPhone home bar
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  proceedButtonDisabled: {
    opacity: 0.5,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
