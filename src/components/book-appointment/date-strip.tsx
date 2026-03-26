import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme'; // Ensure this points to your theme file

interface DateStripProps {
  // Month controlled by MonthSelector — first day of the month
  currentMonth: Date;
  selectedDate: string; // 'YYYY-MM-DD'
  onDateSelect: (date: string) => void;
  // Past dates + explicitly closed days (grey, no indicator)
  disabledDates?: string[];
  // Days that are open but all slots are taken (shows 'Full' badge)
  unavailableDates?: string[];
  activeColor?: string;
}

interface DayItem {
  fullDate: string;
  day: string;
  date: number;
  isToday: boolean;
  isPast: boolean;
  isDisabled: boolean;
  isUnavailable: boolean;
}

// 1. The new, much smarter rolling days function
function buildNextNDays(daysAhead: number, disabledDates: string[], unavailableDates: string[]): DayItem[] {
  const days: DayItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Simply loop from 0 (today) up to the number of days ahead we want
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i); // Automatically handles month/year roll-overs!

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const fullDate = `${yyyy}-${mm}-${dd}`;

    days.push({
      fullDate,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      isToday: i === 0,
      isPast: false, // It's impossible for these to be past days now!
      isDisabled: disabledDates.includes(fullDate),
      isUnavailable: unavailableDates.includes(fullDate),
    });
  }
  return days;
}

// 2. The updated DateStrip Component
export default function DateStrip({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  unavailableDates = [],
  activeColor = COLORS.primary,
}: Omit<DateStripProps, 'currentMonth'>) { // Notice we don't even need currentMonth here anymore!
  
  const scrollRef = useRef<ScrollView>(null);
  
  // Generate exactly 14 days starting from today
  const days = buildNextNDays(14, disabledDates, unavailableDates);

  // Scroll to selected date
  useEffect(() => {
    const idx = days.findIndex((d) => d.fullDate === selectedDate);
    const targetIdx = idx >= 0 ? idx : 0;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ x: targetIdx * 80, animated: true });
    }, 50);
  }, [selectedDate]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {days.map((item) => {
        const isSelected = selectedDate === item.fullDate;
        const isBlocked = item.isDisabled; 
        const isFull = item.isUnavailable; 

        return (
          <TouchableOpacity
            key={item.fullDate}
            onPress={() => !isBlocked && !isFull && onDateSelect(item.fullDate)}
            activeOpacity={isBlocked || isFull ? 1 : 0.75}
            style={[
              styles.card,
              isSelected && { backgroundColor: activeColor, borderColor: activeColor },
              isBlocked && styles.cardBlocked,
              isFull && !isSelected && styles.cardFull,
            ]}>

            {/* Today dot */}
            {item.isToday && !isSelected && (
              <View style={[styles.todayDot, { backgroundColor: activeColor }]} />
            )}

            <Text style={[
              styles.dayLabel,
              isSelected && styles.textWhite,
              isBlocked && styles.textMuted,
              isFull && !isSelected && styles.textMuted,
            ]}>
              {item.isToday ? 'Today' : item.day}
            </Text>

            <Text style={[
              styles.dateNumber,
              isSelected && styles.textWhite,
              isBlocked && styles.textMuted,
              isFull && !isSelected && styles.textMuted,
            ]}>
              {item.date}
            </Text>

            {/* "Full" badge */}
            {isFull && !isSelected && (
              <View style={styles.fullBadge}>
                <Text style={styles.fullBadgeText}>Full</Text>
              </View>
            )}

            {/* Closed dot */}
            {item.isDisabled && !item.isPast && (
              <View style={styles.closedDot} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 8 },

  card: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    position: 'relative',
    gap: 4,
  },
  cardBlocked: { opacity: 0.35 },
  cardFull: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    opacity: 0.75,
  },

  todayDot: {
    position: 'absolute',
    top: 6,
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  closedDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    marginTop: 2,
  },

  dayLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', letterSpacing: 0.3 },
  dateNumber: { fontSize: 22, fontWeight: '800', color: '#111827', lineHeight: 26 },
  textWhite: { color: '#fff' },
  textMuted: { color: '#9CA3AF' },

  fullBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 999,
    marginTop: 2,
  },
  fullBadgeText: { fontSize: 9, fontWeight: '700', color: '#DC2626' },
});