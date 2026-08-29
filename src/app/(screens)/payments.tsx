import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import PaymentsHeroCard from '@/components/payments/payments-hero-card';
import OutstandingPaymentsCard from '@/components/payments/outstanding-payments-card';
import SavedMethodsCard from '@/components/payments/saved-methods-card';
import PaymentHistoryCard from '@/components/payments/payment-history-card';

export default function PaymentsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { getOutstanding, getPaymentMethods, getPaymentHistory } =
        await import('@/lib/api/patient');
      const { usePaymentsStore } = await import('@/stores/payments-store');
      const [outstanding, methods, history] = await Promise.all([
        getOutstanding(),
        getPaymentMethods(),
        getPaymentHistory(),
      ]);
      usePaymentsStore.getState().hydrateFromApi({ outstanding, methods, history });
    } catch {
      /* keep seeds */
    }
  }, []);

  // Refetch on every focus (not just mount): returning from the Aza hosted
  // checkout must surface the PAID flip + new history rows the webhook wrote
  // (bug-triage FE-10).
  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  // Pull-to-refresh (FE-20) — same loader, manual trigger.
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <PaymentsHeroCard />
        <OutstandingPaymentsCard />
        <SavedMethodsCard />
        <PaymentHistoryCard />

        <Text style={styles.footerNote}>
          Pulse never holds your money — payments go directly to the facility&apos;s payment
          provider. Pay-by deadlines and slot release are enforced by the hospital&apos;s booking
          system.
        </Text>
      </ScrollView>
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
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: { padding: 8, width: 40 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  footerNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
  },
});
