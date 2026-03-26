import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import CustomButton from '@/components/ui/custom-button';
import { ToastBanner, ToastVariant } from '@/components/ui/toast-banner';
import MonthSelector from '@/components/book-appointment/month-selector';
import DateStrip from '@/components/book-appointment/date-strip';

const TIME_SLOTS = {
  MORNING: [
    { time: '9:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:15 AM', available: true },
  ],
  AFTERNOON: [
    { time: '2:15 PM', available: true },
    { time: '3:00 PM', available: true },
    { time: '4:30 PM', available: true },
    { time: '5:00 PM', available: false }, // Simulating a booked slot!
  ],
};

const HARDCODED_AVAILABILITY = {
  closedDates: ['2026-03-26', '2023-10-22', '2023-10-29'], // e.g., Sundays
  fullDates: ['2023-10-14'], // e.g., fully booked day
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
      { time: '5:00 PM', available: false }, // Simulating a booked slot
    ],
  },
};
export default function RescheduleScreen() {
  const router = useRouter();

  // State for the selected options
  // const [selectedDate, setSelectedDate] = useState(DATES[0].fullDate);
  const [selectedTime, setSelectedTime] = useState<string | null>('10:30 AM');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [toastData, setToastData] = useState<{ message: string; variant: ToastVariant } | null>(
    null
  );

  const handleDateSelect = (fullDate: string) => {
    if (HARDCODED_AVAILABILITY.fullDates.includes(fullDate)) {
      // Trigger the floating toast!
      setToastData({ message: 'Dr. Arhin is fully booked on this date.', variant: 'error' });
      return;
    }
    setSelectedDate(fullDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reschedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ToastBanner
          variant="warning"
          message="Rescheduling will forfeit your current spot in the Live Queue."
          dismissible={false}
        />
        
        <View style={styles.summaryCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="medical" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.summaryTitle}>General OPD • Dr. Arhin</Text>
            <Text style={styles.summarySubtitle}>KNUST University Hospital</Text>
          </View>
        </View>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Select Date</Text>
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
          disabledDates={HARDCODED_AVAILABILITY?.closedDates} // hospital closed days
          unavailableDates={HARDCODED_AVAILABILITY?.fullDates} // all slots taken
        />
        y{/* --- TIME SLOTS --- */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>
          Available Slots
        </Text>
        {Object.entries(TIME_SLOTS).map(([period, slots]) => (
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
      </ScrollView>

      {/* --- STICKY BOTTOM FOOTER --- */}
      <View style={styles.footer}>
        <CustomButton
          title="Confirm Reschedule"
          disabled={!selectedDate || !selectedTime}
          onPress={() => {
            // Here is where Zustand will eventually fire an action to update the queue!
            router.push('/queue');
          }}
        />
      </View>

      {toastData && (
          <ToastBanner
            floating={true}
            variant={toastData.variant}
            message={toastData.message}
            onDismiss={() => setToastData(null)}
          />
        )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 120, // Space for the sticky footer
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Date Selector
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  dateScroll: {
    marginHorizontal: -20, // Allows the scroll to bleed to the edges
    paddingHorizontal: 20,
  },
  dateCard: {
    width: 64,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  textWhite: {
    color: '#FFFFFF',
  },

  // Time Slots
  timeGroup: {
    marginBottom: 24,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timePill: {
    width: '30%', // Fits 3 across nicely
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
    fontSize: 14,
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

  // Sticky Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32, // Accommodate home indicator on iOS
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});
