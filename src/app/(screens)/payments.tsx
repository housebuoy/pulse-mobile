import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import PaymentsHeroCard from '@/components/payments/payments-hero-card';
import OutstandingPaymentsCard from '@/components/payments/outstanding-payments-card';
import SavedMethodsCard from '@/components/payments/saved-methods-card';
import PaymentHistoryCard from '@/components/payments/payment-history-card';

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
