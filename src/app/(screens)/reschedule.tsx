import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { COLORS } from '@/constants/theme';
import CustomButton from '@/components/ui/custom-button';
import { ToastBanner } from '@/components/ui/toast-banner';
import { useToast } from '@/components/ui/toast-provider';
import MonthSelector from '@/components/book-appointment/month-selector';
import DateStrip from '@/components/book-appointment/date-strip';
import { HospitalAvailability, MockTimeSlot } from '@/services/mock/hospital-schedule';
import { useQueueStore } from '@/stores/queue-store';
import { useBookingStore } from '@/stores/booking-store';
import { ApiError } from '@/lib/api/client';

const HOSPITAL_ID = 'knust-university-hospital';
const SURCHARGE_CODE = 'EARLIER_RESCHEDULE_SURCHARGE_REQUIRED';
const SURCHARGE_LABEL = 'GH₵ 20';
const RETRY_ATTEMPTS = 10; // ~30s of 3s retries after the checkout returns
const RETRY_INTERVAL_MS = 3000;

function firstString(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Backend rejects earlier-slot moves with HTTP 402 + this code until the
 *  surcharge is paid (frozen wave-2 contract). */
function isSurchargeRequired(e: unknown): boolean {
  if (!(e instanceof ApiError) || e.status !== 402) return false;
  const body = e.body && typeof e.body === 'object' ? (e.body as { code?: unknown }) : {};
  return body.code === SURCHARGE_CODE;
}

function errorMessage(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attemptReschedule(targetId: string, date: string, time: string): Promise<void> {
  const { rescheduleBooking } = await import('@/lib/api/discovery');
  await rescheduleBooking(targetId, date, time);
}

/** Ask whether to pay the earlier-reschedule surcharge now. */
function confirmSurchargePrompt(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      `Earlier reschedule requires ${SURCHARGE_LABEL}`,
      `Moving this appointment to an earlier slot costs a ${SURCHARGE_LABEL} surcharge. Pay it now and we will apply the change automatically.`,
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Pay & Reschedule', onPress: () => resolve(true) },
      ]
    );
  });
}

/** Resolve when the app comes back to the foreground (hosted Aza checkout). */
function waitForAppActive(): Promise<void> {
  return new Promise((resolve) => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
    // If the checkout never backgrounded the app (open failed / web mock),
    // don't hang the confirm — start the retry loop shortly anyway.
    setTimeout(() => {
      sub.remove();
      resolve();
    }, 4000);
  });
}

function fmtScheduled(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, yyyy • h:mm a');
  } catch {
    return iso;
  }
}

export default function RescheduleScreen() {
  const router = useRouter();
  const { show } = useToast();
  const params = useLocalSearchParams<{
    bookingId?: string | string[];
    departmentId?: string | string[];
    hospitalName?: string | string[];
    departmentName?: string | string[];
    doctorName?: string | string[];
    reference?: string | string[];
    scheduledAt?: string | string[];
  }>();
  const ticket = useQueueStore((state) => state.ticket);

  // Wave-2: Home hero cards deep-link here with full booking context. The
  // queue-tab entry point still passes nothing and falls back to the booking
  // store's lastBookingId (today's behavior) so that path keeps working.
  const routeBookingId = firstString(params.bookingId);
  const routeDepartmentId = firstString(params.departmentId);
  const routeDepartmentName = firstString(params.departmentName);
  const routeDoctorName = firstString(params.doctorName);
  const routeHospitalName = firstString(params.hospitalName);
  const routeReference = firstString(params.reference);
  const routeScheduledAt = firstString(params.scheduledAt);

  // State for the selected options
  const [selectedTime, setSelectedTime] = useState<string | null>('10:30 AM');
  const [currentMonth, setCurrentMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  // --- Availability now comes from the shared mock service instead of a
  // hardcoded literal, so this screen and Hospital Details read the same
  // source. ---
  const [availability, setAvailability] = useState<HospitalAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingAvailability(true);
    const deptId = routeDepartmentId ?? useBookingStore.getState().departmentId ?? HOSPITAL_ID;
    const from = currentMonth.toISOString().split('T')[0];
    import('@/lib/api/discovery')
      .then(({ getAvailability }) => getAvailability(deptId, from, 14))
      .then((data) => {
        if (!cancelled) {
          setAvailability(data);
          setLoadingAvailability(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentMonth, routeDepartmentId]);

  const daySlots = availability?.slots[selectedDate] ?? { MORNING: [], AFTERNOON: [] };

  // Display context: deep-link params win (no queue ticket on that path),
  // then the live-queue ticket, then the booking store.
  const deptLabel =
    routeDepartmentName || ticket.department || useBookingStore.getState().department || '';
  const doctorLabel = routeDoctorName || ticket.doctorName || '';
  const hospitalLabel =
    routeHospitalName || ticket.hospitalName || useBookingStore.getState().facilityName || '';
  const referenceLabel = routeReference || ticket.bookingReference || '';

  const handleDateSelect = (fullDate: string) => {
    if (availability?.fullDates.includes(fullDate)) {
      show({ body: 'Dr. Arhin is fully booked on this date.', variant: 'error' });
      return;
    }
    if (availability?.closedDates.includes(fullDate)) {
      show({ body: 'KNUST Hospital is closed on this date.', variant: 'error' });
      return;
    }
    setSelectedDate(fullDate);
  };

  // 402 path: pick a saved method, open the hosted Aza checkout for the GH₵20
  // surcharge, then retry the SAME PATCH until the webhook registers it.
  const paySurchargeThenRetry = async (
    targetId: string,
    date: string,
    time: string
  ): Promise<'rescheduled' | 'pending' | 'no-method'> => {
    const { getPaymentMethods } = await import('@/lib/api/patient');
    const { payRescheduleSurcharge } = await import('@/lib/api/discovery');
    const methods = await getPaymentMethods();
    const method = methods.find((m) => m.isDefault) ?? methods[0];
    if (!method) {
      await new Promise<void>((resolve) => {
        Alert.alert(
          'Add a payment method',
          'Paying the earlier-reschedule surcharge needs a saved payment method. Add one in Payments, then come back and confirm again.',
          [
            { text: 'Not now', style: 'cancel', onPress: () => resolve() },
            {
              text: 'Go to Payments',
              onPress: () => {
                resolve();
                router.push('/(screens)/payments');
              },
            },
          ]
        );
      });
      return 'no-method';
    }

    const { checkoutUrl } = await payRescheduleSurcharge(targetId, method.id);
    if (checkoutUrl) {
      // Hosted Aza checkout backgrounds the app — no success alert here (same
      // pattern as the payments screen, FE-25): confirm by re-running the
      // PATCH once the patient returns to the app.
      await Linking.openURL(checkoutUrl);
    }
    await waitForAppActive();

    for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
      await sleep(RETRY_INTERVAL_MS);
      try {
        await attemptReschedule(targetId, date, time);
        return 'rescheduled';
      } catch (e) {
        if (!isSurchargeRequired(e)) throw e;
      }
    }

    await new Promise<void>((resolve) => {
      Alert.alert(
        'Payment pending',
        'The surcharge payment is still being confirmed. If you completed it, tap Confirm Reschedule again in a moment — otherwise the change was not applied.',
        [{ text: 'OK', onPress: () => resolve() }]
      );
    });
    return 'pending';
  };

  const handleConfirm = async () => {
    if (submitting) return;
    const date = selectedDate;
    const time = selectedTime ?? '';
    if (!date || !time) return;
    setSubmitting(true);
    try {
      const store = useBookingStore.getState();
      const targetId =
        routeBookingId ??
        store.lastBookingId ??
        (ticket?.bookingId != null ? String(ticket.bookingId) : null);
      if (!targetId) {
        setSubmitting(false);
        show({ body: 'No booking to reschedule.', variant: 'error' });
        return;
      }

      // 1) Try the plain PATCH — succeeds unless the new slot is earlier
      //    than the current one (backend answers HTTP 402).
      let surchargeNeeded = false;
      try {
        await attemptReschedule(targetId, date, time);
      } catch (e) {
        if (!isSurchargeRequired(e)) {
          setSubmitting(false);
          show({ body: errorMessage(e, 'Reschedule failed'), variant: 'error' });
          return;
        }
        surchargeNeeded = true;
      }

      if (surchargeNeeded) {
        // 2) Pay the GH₵20 surcharge (hosted Aza checkout), then retry the
        //    SAME request until the webhook registers the payment.
        if (!(await confirmSurchargePrompt())) {
          setSubmitting(false);
          return;
        }
        let outcome: 'rescheduled' | 'pending' | 'no-method';
        try {
          outcome = await paySurchargeThenRetry(targetId, date, time);
        } catch (e) {
          setSubmitting(false);
          show({ body: errorMessage(e, 'Surcharge payment failed. Try again.'), variant: 'error' });
          return;
        }
        if (outcome !== 'rescheduled') {
          setSubmitting(false); // 'no-method' / 'pending' already alerted the patient
          return;
        }
        setSubmitting(false);
        show({ body: 'Appointment rescheduled.', variant: 'success' });
        router.back();
        return;
      }

      setSubmitting(false);
      show({ body: 'Appointment rescheduled.', variant: 'success' });
      router.back();
    } catch (e) {
      setSubmitting(false);
      show({ body: errorMessage(e, 'Reschedule failed'), variant: 'error' });
    }
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
          <View style={styles.summaryBody}>
            <Text style={styles.summaryTitle}>
              {deptLabel}
              {doctorLabel ? ` • ${doctorLabel}` : ''}
            </Text>
            <Text style={styles.summarySubtitle}>{hospitalLabel}</Text>
            {referenceLabel ? (
              <Text style={styles.summaryMeta}>Booking {referenceLabel}</Text>
            ) : null}
            {routeScheduledAt ? (
              <Text style={styles.summaryMeta}>Currently {fmtScheduled(routeScheduledAt)}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.consCard}>
          <View style={styles.consHeader}>
            <Ionicons name="warning-outline" size={16} color="#B45309" />
            <Text style={styles.consTitle}>Cons of rescheduling</Text>
          </View>
          <Text style={styles.consItem}>
            {'\u2022'} You may be assigned a different doctor.
          </Text>
          <Text style={styles.consItem}>
            {'\u2022'} Your live-queue spot is forfeited — you rejoin at the back of the new
            slot&apos;s queue.
          </Text>
          <Text style={styles.consItem}>
            {'\u2022'} Moving to an EARLIER slot costs a {SURCHARGE_LABEL} surcharge, paid before
            the change applies.
          </Text>
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
          onDateSelect={handleDateSelect}
          disabledDates={availability?.closedDates ?? []} // hospital closed days
          unavailableDates={availability?.fullDates ?? []} // all slots taken
        />
        {/* --- TIME SLOTS --- */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>
          Available Slots
        </Text>
        {loadingAvailability ? (
          <View style={styles.loadingSlots}>
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          Object.entries(daySlots).map(([period, slots]: [string, MockTimeSlot[]]) => (
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
          ))
        )}
      </ScrollView>

      {/* --- STICKY BOTTOM FOOTER --- */}
      <View style={styles.footer}>
        <CustomButton
          title="Confirm Reschedule"
          disabled={!selectedDate || !selectedTime}
          isLoading={submitting}
          onPress={() => {
            void handleConfirm();
          }}
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

  // Summary Card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 16,
  },
  summaryBody: { flex: 1 },
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
  summaryMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 4,
  },

  // Cons of rescheduling notice
  consCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    marginBottom: 32,
    gap: 6,
  },
  consHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  consTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  consItem: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 19,
    fontWeight: '500',
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

  // Time Slots
  loadingSlots: {
    paddingVertical: 40,
    alignItems: 'center',
  },
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
