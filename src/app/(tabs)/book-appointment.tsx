import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';
import SearchBar from '../../components/ui/search-bar';
import EmergencyBanner from '../../components/ui/emergency-banner';
import CategoryPills from '../../components/ui/category-pills';
import HospitalCard from '../../components/ui/hospital-card';
import SectionHeader from '@/components/shared/section-header';

const BANNER_HEIGHT = 80;

export default function BookAppointmentScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('General');
  const scrollY = useRef(new Animated.Value(0)).current;

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
        <TouchableOpacity onPress={() => router.back()} style={styles.headerSideBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Animated.View style={[styles.headerSideBtn, { opacity: sosOpacity, alignItems: 'flex-end' }]}>
          <TouchableOpacity style={styles.sosButton} onPress={() => router.push('/emergency-triage')}>
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
          <EmergencyBanner />
        </Animated.View>

        {/* CHILD 1 — pills stick */}
        <Animated.View style={[styles.pillsContainer, {
          borderBottomColor: pillBorderOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(229,231,235,0)', 'rgba(229,231,235,1)'],
          }),
        }]}>
          <CategoryPills
            categories={['General', 'Dentist', 'Eye', 'Cardiology']}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </Animated.View>

        {/* CHILD 2 — cards */}
        <View style={styles.cardsWrapper}>
          <SectionHeader title="Available Hospitals" />
          <HospitalCard name="KNUST University Hospital" location="University Road, Kumasi • Open 24/7" distance="2.5 km" waitStatus="Low Wait" nextSlot="10:30 AM" rating="4.8 (120+)" imageUrl="https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2000&auto=format&fit=crop" onPress={() => router.push({ pathname: '/(screens)/hospital-details', params: { name: 'KNUST University Hospital', location: 'University Road, Kumasi • Open 24/7', distance: '2.5 km', waitStatus: 'Low Wait', nextSlot: '10:30 AM', rating: '4.8 (120+)', imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2000&auto=format&fit=crop', status: 'Open 24/7' } })} />
          <HospitalCard name="Komfo Anokye Teaching" location="Bantama, Kumasi • Referral Center" distance="4.2 km" waitStatus="Moderate Wait" nextSlot="2:15 PM" rating="4.5 (850+)" imageUrl="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop" onPress={() => router.push({ pathname: '/(screens)/hospital-details', params: { name: 'Komfo Anokye Teaching', location: 'Bantama, Kumasi • Referral Center', distance: '4.2 km', waitStatus: 'Moderate Wait', nextSlot: '2:15 PM', rating: '4.5 (850+)', imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop', status: 'Referral Center' } })} />
          <HospitalCard name="HopeXchange Medical" location="Santasi, Kumasi • Specialist Care" distance="1.8 km" waitStatus="High Wait" nextSlot="Tomorrow" rating="4.9 (56)" imageUrl="https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop" onPress={() => router.push({ pathname: '/(screens)/hospital-details', params: { name: 'HopeXchange Medical', location: 'Santasi, Kumasi • Specialist Care', distance: '1.8 km', waitStatus: 'High Wait', nextSlot: 'Tomorrow', rating: '4.9 (56)', imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop', status: 'Specialist Care' } })} />
        </View>
      </Animated.ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <Ionicons name="map" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  headerSideBtn: { width: 70, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sosButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, gap: 4 },
  sosText: { color: '#DC2626', fontWeight: '800', fontSize: 12 },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 100 },
  bannerWrapper: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  pillsContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1 },
  cardsWrapper: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
});