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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import DateStrip from '@/components/book-appointment/date-strip';
import MonthSelector from '@/components/book-appointment/month-selector';
import TimeSlotPicker, { TimeSlot } from '@/components/book-appointment/time-slot-picker';
import Divider from '@/components/ui/divider';
import Dropdown, { DropdownOption } from '@/components/ui/dropdown-menu';
import { HospitalAvailability } from '@/services/mock/hospital-schedule';
import { useBookingStore } from '@/stores/booking-store';
import type { DepartmentOption } from '@/lib/api/discovery';

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

  useEffect(() => {
    setFacility(HOSPITAL.name, HOSPITAL.location, HOSPITAL.id);
  }, [setFacility, HOSPITAL.name, HOSPITAL.location, HOSPITAL.id]);

  useEffect(() => {
    import('@/lib/api/discovery').then(({ listDepartments }) =>
      listDepartments(HOSPITAL.id).then((rows: DepartmentOption[]) => {
        setDeptOptions(rows.map((d) => ({ label: d.name, value: String(d.id) })));
        const map: Record<string, number> = {};
        rows.forEach((d) => {
          map[String(d.id)] = d.id;
        });
        setDeptMap(map);
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

  useEffect(() => {
    let cancelled = false;
    setLoadingAvailability(true);
    const from = currentMonth.toISOString().split('T')[0];
    const deptId = department && deptMap[department] ? deptMap[department] : department;
    import('@/lib/api/discovery').then(({ getAvailability }) =>
      getAvailability(deptId || HOSPITAL.id, from, 14).then((data) => {
        if (!cancelled) {
          setAvailability(data);
          setLoadingAvailability(false);
        }
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
        <TouchableOpacity style={styles.circleButton}>
          <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
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
            <TouchableOpacity style={styles.aiAssistButton}>
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

          {loadingAvailability ? (
            <View style={styles.loadingSlots}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <TimeSlotPicker
              slots={flatSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          )}
        </View>
      </Animated.ScrollView>

      {/* --- STICKY FOOTER --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!selectedDate || !selectedTime) && styles.proceedButtonDisabled,
          ]}
          disabled={!selectedDate || !selectedTime}
          onPress={async () => {
            try {
              const { bookMobile } = await import('@/lib/api/discovery');
              const { getOutstanding } = await import('@/lib/api/patient');
              const { usePaymentsStore } = await import('@/stores/payments-store');
              const deptId = useBookingStore.getState().departmentId ?? Number(department);
              const result = await bookMobile(deptId, selectedDate, selectedTime ?? '');
              const id = result && typeof result === 'object' && 'id' in result
                ? String((result as { id: unknown }).id)
                : null;
              setLastBookingId(id);
              try {
                const outstanding = await getOutstanding();
                usePaymentsStore.getState().hydrateFromApi({ outstanding });
              } catch {
                /* ignore */
              }
              router.replace('/(tabs)/home');
            } catch (e) {
              alert(e instanceof Error ? e.message : 'Booking failed');
            }
          }}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
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
    padding: 4,
  },
  aiAssistText: {
    fontSize: 13,
    fontWeight: '600',
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
