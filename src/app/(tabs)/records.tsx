import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import SearchBar from '../../components/ui/search-bar';
import MedicalIdBanner from '../../components/records/medical-banner';
import RecordsTabs from '../../components/records/category-tab';
import MedicalRecordCard from '../../components/records/medical-record-card';
import IconButton from '@/components/ui/header-badge';
import Divider from '@/components/ui/divider';

const BANNER_HEIGHT = 90;

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState('Visits');
  const scrollY = useRef(new Animated.Value(0)).current;

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const tabBorderOpacity = scrollY.interpolate({
    inputRange: [BANNER_HEIGHT * 0.5, BANNER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <IconButton icon="share-outline" />
      </View>

      {/* 2. SEARCH BAR — pinned */}
      <View style={styles.searchContainer}>
        <SearchBar placeholder="Search visits, doctors, or labs..." />
      </View>

      {/* 3. SCROLL */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}>

        {/* CHILD 0 — banner fades out */}
        <Animated.View style={[styles.bannerWrapper, { opacity: bannerOpacity }]}>
          <MedicalIdBanner onPress={() => {}} />
        </Animated.View>

        {/* CHILD 1 — tabs stick */}
        <Animated.View style={[styles.tabsContainer, {
          borderBottomColor: tabBorderOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(229,231,235,0)', 'rgba(229,231,235,1)'],
          }),
        }]}>
          <RecordsTabs
            tabs={['Visits', 'Lab Results', 'Prescriptions']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Animated.View>

        {/* CHILD 2 — records */}
        <View style={styles.cardsWrapper}>
          <MedicalRecordCard department="General OPD" hospital="KNUST University Hospital" date="12 Oct 2025" doctor="Dr. E. Arhin" summary="Treated for acute Malaria. Prescribed Artemether-Lumefantrine. Patient advised to rest and hydrate." onPress={() => {}} />
          <MedicalRecordCard department="Dental Clinic" hospital="Komfo Anokye Teaching" date="04 Aug 2025" doctor="Dr. S. Mensah" summary="Routine cleaning and cavity filling (Tooth 14). Patient reported mild sensitivity." onPress={() => {}} />
          <Divider label="OLDER RECORDS" thickness={2}/>
          <MedicalRecordCard department="Cardiology" hospital="Korle-Bu Teaching Hospital" date="15 Feb 2024" doctor="Dr. K. Ofori" summary="Annual cardiac checkup. BP 120/80. ECG normal. No murmurs detected." onPress={() => {}} />
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#111827' },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 100 },
  bannerWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  tabsContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 8, borderBottomWidth: 1 },
  cardsWrapper: { paddingHorizontal: 20, paddingTop: 12 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { paddingHorizontal: 16, fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1 },
});