import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import SearchBar from '../../components/ui/search-bar';
import EmergencyBanner from '../../components/ui/emergency-banner';
import CategoryPills from '../../components/ui/category-pills';
import HospitalCard from '../../components/ui/hospital-card';
import SectionHeader from '@/components/shared/section-header';
import type { HospitalCard as HospitalCardData } from '@/lib/api/discovery';

const BANNER_HEIGHT = 80;

export default function BookAppointmentScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('General');
  const [hospitals, setHospitals] = useState<HospitalCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    import('@/lib/api/discovery')
      .then(({ listHospitals }) => listHospitals())
      .then((data) => {
        if (active) setHospitals(data);
      })
      .catch(() => {
        if (active) setHospitals([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const sosOpacity = scrollY.interpolate({
    inputRange: [BANNER_HEIGHT * 0.5, BANNER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, BANNER_HEIGHT * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const pillBorderOpacity = scrollY.interpolate({
    inputRange: [BANNER_HEIGHT * 0.5, BANNER_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => router.back()} style={styles.headerSideBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Animated.View
          style={[styles.headerSideBtn, { opacity: sosOpacity, alignItems: 'flex-end' }]}>
          <TouchableOpacity style={styles.sosButton} onPress={() => Linking.openURL('tel:112')}>
            <Ionicons name="warning" size={16} color="#DC2626" />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 2. SEARCH BAR — pinned */}
      <View style={styles.searchContainer}>
        <SearchBar />
      </View>

      {/* 3. SCROLL */}
      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[1]}>
        {/* CHILD 0 — banner fades out */}
        <Animated.View style={[styles.bannerWrapper, { opacity: bannerOpacity }]}>
          <EmergencyBanner />
        </Animated.View>

        {/* CHILD 1 — pills stick */}
        <Animated.View
          style={[
            styles.pillsContainer,
            {
              borderBottomColor: pillBorderOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(229,231,235,0)', 'rgba(229,231,235,1)'],
              }),
            },
          ]}>
          <CategoryPills
            categories={['General', 'Dentist', 'Eye', 'Cardiology']}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </Animated.View>

        {/* CHILD 2 — cards */}
        <View style={styles.cardsWrapper}>
          <SectionHeader title="Available Hospitals" />
          {loading ? (
            <>
              <HospitalCardSkeleton />
              <HospitalCardSkeleton />
              <HospitalCardSkeleton />
            </>
          ) : hospitals.length === 0 ? (
            <Text style={styles.emptyText}>
              No hospitals available right now. Please check back soon.
            </Text>
          ) : (
            hospitals.map((h) => (
              <HospitalCard
                key={h.id}
                name={h.name}
                location={`${h.location} • ${h.status}`}
                distance={h.distanceKm != null ? `${h.distanceKm} km` : '—'}
                waitStatus={
                  /high/i.test(h.waitTime)
                    ? 'High Wait'
                    : /moderat/i.test(h.waitTime)
                      ? 'Moderate Wait'
                      : 'Low Wait'
                }
                nextSlot="—"
                rating={`${h.rating} (${h.reviews})`}
                imageUrl={h.image}
                onPress={() =>
                  router.push({
                    pathname: '/(screens)/hospital-details',
                    params: {
                      id: h.id,
                      name: h.name,
                      location: h.location,
                      distance: h.distanceKm != null ? `${h.distanceKm} km` : '—',
                      waitStatus: h.waitTime,
                      rating: String(h.rating),
                      reviews: h.reviews,
                      imageUrl: h.image,
                      status: h.status,
                    },
                  })
                }
              />
            ))
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerSideBtn: { width: 70, justifyContent: 'center' },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  sosText: { color: '#DC2626', fontWeight: '800', fontSize: 12 },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 100 },
  bannerWrapper: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  pillsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  cardsWrapper: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  emptyText: { color: '#6B7280', fontSize: 14, textAlign: 'center', paddingVertical: 32 },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  skeletonImage: { height: 140, backgroundColor: '#E5E7EB' },
  skeletonBody: { padding: 14, gap: 10 },
  skeletonLine: { height: 14, borderRadius: 7, backgroundColor: '#E5E7EB' },
});

/** Pulsing placeholder shown while the hospital list loads (no blank flash). */
function HospitalCardSkeleton() {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={styles.skeletonCard}>
      <Animated.View style={[styles.skeletonImage, { opacity: pulse }]} />
      <View style={styles.skeletonBody}>
        <Animated.View style={[styles.skeletonLine, { width: '60%', opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLine, { width: '85%', opacity: pulse }]} />
        <Animated.View style={[styles.skeletonLine, { width: '40%', opacity: pulse }]} />
      </View>
    </View>
  );
}
