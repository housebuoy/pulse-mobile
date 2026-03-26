import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

export interface TimeSlot {
  time: string;      // e.g. '9:00 AM'
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  activeColor?: string;
}

type Period = 'MORNING' | 'AFTERNOON' | 'EVENING';

const PERIOD_ORDER: Period[] = ['MORNING', 'AFTERNOON', 'EVENING'];
const PERIOD_LABELS: Record<Period, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
};

function timeToMinutes(time: string): number {
  const [rawTime, period] = time.trim().split(' ');
  const [hoursStr, minutesStr] = rawTime.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getPeriod(time: string): Period {
  const mins = timeToMinutes(time);
  if (mins < 12 * 60) return 'MORNING';
  if (mins < 17 * 60) return 'AFTERNOON';
  return 'EVENING';
}

function groupAndSort(slots: TimeSlot[]): Record<Period, TimeSlot[]> {
  const groups: Record<Period, TimeSlot[]> = { MORNING: [], AFTERNOON: [], EVENING: [] };
  for (const slot of slots) {
    groups[getPeriod(slot.time)].push(slot);
  }
  for (const period of PERIOD_ORDER) {
    groups[period].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  }
  return groups;
}

export default function TimeSlotPicker({
  slots,
  selectedTime,
  onSelectTime,
  activeColor = COLORS.primary,
}: TimeSlotPickerProps) {
  // Filter out booked slots entirely before rendering
  const availableSlots = slots.filter((s) => s.available);

  // No available slots at all — show empty state
  if (availableSlots.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="calendar-clear-outline" size={32} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Available Slots</Text>
        <Text style={styles.emptySubtitle}>
          All slots for this date are fully booked.{'\n'}Please select another date.
        </Text>
      </View>
    );
  }

  const groups = groupAndSort(availableSlots);

  return (
    <View>
      {PERIOD_ORDER.map((period) => {
        const periodSlots = groups[period];
        if (periodSlots.length === 0) return null;

        return (
          <View key={period} style={styles.group}>
            <Text style={styles.periodLabel}>{PERIOD_LABELS[period]}</Text>
            <View style={styles.grid}>
              {periodSlots.map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <TouchableOpacity
                    key={slot.time}
                    onPress={() => onSelectTime(slot.time)}
                    activeOpacity={0.7}
                    style={[
                      styles.pill,
                      isSelected && { backgroundColor: activeColor, borderColor: activeColor },
                    ]}>
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: 24 },
  periodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pill: {
    width: '30%',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  pillText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  pillTextActive: { color: '#FFFFFF' },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});