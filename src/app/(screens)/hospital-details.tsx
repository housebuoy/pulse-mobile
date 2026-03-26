import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/constants/theme';
import CustomButton from '@/components/ui/custom-button';
import MonthSelector from '@/components/book-appointment/month-selector';
import DateStrip from '@/components/book-appointment/date-strip';

const DEPARTMENTS = ['General OPD', 'Cardiology', 'Dental', 'Eye Clinic', 'Pediatrics'];

const HARDCODED_AVAILABILITY = {
  closedDates: [] as string[],
  fullDates: [] as string[],
  slots: {
    MORNING: [
      { time: '9:00 AM', available: true },
      { time: '10:30 AM', available: true },
      { time: '11:15 AM', available: true },
    ],
    AFTERNOON: [
      { time: '2:15 PM', available: true },
      { time: '3:00 PM', available: true },
      { time: '4:30 PM', available: true },
      { time: '5:00 PM', available: false },
    ],
  },
};

const STEPS = [
  { id: 1, label: 'Department' },
  { id: 2, label: 'Date' },
  { id: 3, label: 'Slot' },
];

export default function HospitalDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    location: string;
    distance: string;
    waitStatus: string;
    nextSlot: string;
    rating: string;
    imageUrl: string;
    status: string;
  }>();

  const {
    name = 'KNUST University Hospital',
    location = 'University Road, Kumasi • Open 24/7',
    distance = '2.5 km',
    waitStatus = 'Low Wait',
    rating = '4.8 (120+)',
    imageUrl = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2000&auto=format&fit=crop',
    status = 'Open 24/7',
  } = params;

  const waitLabel = waitStatus.replace(' Wait', '');
  const waitColor =
    waitStatus === 'Low Wait'
      ? COLORS.success
      : waitStatus === 'Moderate Wait'
        ? COLORS.warning
        : COLORS.danger;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [selectedDepartment, setSelectedDepartment] = useState('General OPD');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  // Step 2 state
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Step 3 state
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleProceed = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step: confirm booking
      router.back();
    }
  };

  const isProceedEnabled = () => {
    if (currentStep === 1) return !!selectedDepartment;
    if (currentStep === 2) return !!selectedDate;
    if (currentStep === 3) return !!selectedTime;
    return false;
  };

  const ratingValue = rating.split(' ')[0];
  const reviewCount = rating.includes('(') ? rating.substring(rating.indexOf('(')) : '';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── HERO IMAGE ── */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />

          {/* Gradient overlay */}
          <View style={styles.heroOverlay} />

          {/* Top buttons */}
          <SafeAreaView edges={['top']} style={styles.heroTopBar}>
            <TouchableOpacity style={styles.heroIconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroIconBtn}
              onPress={() => setIsBookmarked(!isBookmarked)}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Hospital name & rating on image */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={2}>{name}</Text>
            <View style={styles.heroRatingRow}>
              <Ionicons name="star" size={14} color="#EAB308" />
              <Text style={styles.heroRatingText}>{ratingValue}</Text>
              <Text style={styles.heroReviewText}>{reviewCount} reviews</Text>
            </View>
          </View>
        </View>

        {/* ── HOSPITAL INFO CARD ── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoName}>{name}</Text>
          <View style={styles.infoLocationRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.infoLocation} numberOfLines={1}>{location}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.facilityLink}>View facility details →</Text>
          </TouchableOpacity>

          {/* 3 Info Pills */}
          <View style={styles.pillsRow}>
            <View style={styles.infoPill}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoPillLabel}>Distance</Text>
              <Text style={styles.infoPillValue}>{distance}</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="time-outline" size={16} color={waitColor} />
              <Text style={styles.infoPillLabel}>Wait Time</Text>
              <Text style={[styles.infoPillValue, { color: waitColor }]}>{waitLabel}</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="medical-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoPillLabel}>Status</Text>
              <Text style={styles.infoPillValue}>{status}</Text>
            </View>
          </View>
        </View>

        {/* ── STEP INDICATOR ── */}
        <View style={styles.stepIndicator}>
          {STEPS.map((step, index) => {
            const isDone = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isActive && styles.stepCircleActive,
                      isDone && styles.stepCircleDone,
                    ]}>
                    {isDone ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stepNumber,
                          isActive && styles.stepNumberActive,
                        ]}>
                        {step.id}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                      isDone && styles.stepLabelDone,
                    ]}>
                    {step.label}
                  </Text>
                </View>
                {index < STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepConnector,
                      (isDone || (isActive && index === 0)) && styles.stepConnectorActive,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* ── STEP CONTENT ── */}

        {/* STEP 1: Department */}
        {currentStep >= 1 && (
          <View style={[styles.stepSection, currentStep !== 1 && styles.stepSectionMuted]}>
            <Text style={styles.stepSectionTitle}>Step 1: Select Department</Text>

            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => currentStep === 1 && setShowDeptDropdown(!showDeptDropdown)}
              activeOpacity={0.8}>
              <Text style={styles.dropdownValue}>{selectedDepartment}</Text>
              <Ionicons
                name={showDeptDropdown ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showDeptDropdown && currentStep === 1 && (
              <View style={styles.dropdownList}>
                {DEPARTMENTS.map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    style={[
                      styles.dropdownItem,
                      selectedDepartment === dept && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedDepartment(dept);
                      setShowDeptDropdown(false);
                    }}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedDepartment === dept && styles.dropdownItemTextActive,
                      ]}>
                      {dept}
                    </Text>
                    {selectedDepartment === dept && (
                      <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentStep === 1 && (
              <TouchableOpacity style={styles.aiHelper}>
                <Ionicons name="sparkles-outline" size={14} color={COLORS.primary} />
                <Text style={styles.aiHelperText}>Not sure? Ask AI</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* STEP 2: Select Date */}
        {currentStep >= 2 && (
          <View style={[styles.stepSection, currentStep !== 2 && styles.stepSectionMuted]}>
            <View style={styles.stepSectionHeaderRow}>
              <Text style={styles.stepSectionTitle}>Step 2: Select Date</Text>
              {currentStep === 2 && (
                <MonthSelector
                  selectedMonth={currentMonth}
                  readOnly={true}
                  onMonthChange={(newMonth) => {
                    setCurrentMonth(newMonth);
                    setSelectedDate(newMonth.toISOString().split('T')[0]);
                  }}
                />
              )}
            </View>

            {currentStep === 2 && (
              <DateStrip
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                disabledDates={HARDCODED_AVAILABILITY.closedDates}
                unavailableDates={HARDCODED_AVAILABILITY.fullDates}
              />
            )}

            {currentStep > 2 && (
              <Text style={styles.stepSummaryText}>{selectedDate}</Text>
            )}
          </View>
        )}

        {/* STEP 3: Available Slots */}
        {currentStep >= 3 && (
          <View style={[styles.stepSection, currentStep !== 3 && styles.stepSectionMuted]}>
            <Text style={styles.stepSectionTitle}>Step 3: Available Slots</Text>

            {currentStep === 3 &&
              Object.entries(HARDCODED_AVAILABILITY.slots).map(([period, slots]) => (
                <View key={period} style={styles.timeGroup}>
                  <Text style={styles.periodLabel}>{period}</Text>
                  <View style={styles.timeGrid}>
                    {slots.map((slot) => {
                      const isSelected = selectedTime === slot.time;
                      return (
                        <TouchableOpacity
                          key={slot.time}
                          disabled={!slot.available}
                          style={[
                            styles.timePill,
                            isSelected && styles.timePillActive,
                            !slot.available && styles.timePillDisabled,
                          ]}
                          onPress={() => setSelectedTime(slot.time)}
                          activeOpacity={0.7}>
                          <Text
                            style={[
                              styles.timeText,
                              isSelected && styles.timeTextActive,
                              !slot.available && styles.timeTextDisabled,
                            ]}>
                            {slot.time}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* ── STICKY FOOTER ── */}
      <View style={styles.footer}>
        <CustomButton
          title={currentStep < 3 ? `Proceed →` : 'Confirm Booking →'}
          disabled={!isProceedEnabled()}
          onPress={handleProceed}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Hero
  heroContainer: {
    height: 260,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  heroTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  heroIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroRatingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroReviewText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Info Card
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    zIndex: 10,
  },
  infoName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  infoLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  infoLocation: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  facilityLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoPill: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoPillLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoPillValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepCircleDone: {
    backgroundColor: COLORS.success,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  stepLabelDone: {
    color: COLORS.success,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
    marginHorizontal: 4,
  },
  stepConnectorActive: {
    backgroundColor: COLORS.success,
  },

  // Step Section
  stepSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepSectionMuted: {
    opacity: 0.55,
  },
  stepSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  stepSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Department Dropdown
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 8,
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  aiHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  aiHelperText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Time Slots
  timeGroup: {
    marginBottom: 20,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timePill: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  timePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timePillDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  timeTextActive: {
    color: '#FFFFFF',
  },
  timeTextDisabled: {
    color: '#D1D5DB',
    textDecorationLine: 'line-through',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
