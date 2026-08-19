import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { COLORS } from '@/constants/theme';
import SearchBar from '../../components/ui/search-bar';
import MedicalIdBanner from '../../components/records/medical-banner';
import RecordsTabs from '../../components/records/category-tab';
import MedicalRecordCard from '../../components/records/medical-record-card';
import LabResultCard from '../../components/records/lab-result-card';
import PrescriptionCard from '../../components/records/prescription-card';
import VisitDetailSheet from '../../components/records/visit-detail-sheet';
import LabResultDetailSheet from '../../components/records/lab-result-detail-sheet';
import PrescriptionDetailSheet from '../../components/records/prescription-detail-sheet';
import RecordsFilterSheet from '../../components/records/records-filter-sheet';
import IconButton from '@/components/ui/header-badge';
import Divider from '@/components/ui/divider';
import { LabResult, Prescription, Visit, useRecordsStore } from '@/stores/records-store';
import { withRecencyDivider } from '@/utils/group-by-recency';
import {
  DEFAULT_RECORDS_FILTER,
  RecordsFilterState,
  isFilterActive,
  isWithinDatePreset,
  matchesQuery,
  uniqueSorted,
} from '@/utils/records-filter';

const BANNER_HEIGHT = 90;

type TabKey = 'Visits' | 'Lab Results' | 'Prescriptions';
const TABS: TabKey[] = ['Visits', 'Lab Results', 'Prescriptions'];

export default function RecordsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('Visits');
  const scrollY = useRef(new Animated.Value(0)).current;

  const visits = useRecordsStore((state) => state.visits);
  const hydrateFromApi = useRecordsStore((state) => state.hydrateFromApi);

  useEffect(() => {
    import('@/lib/api/records')
      .then(({ getRecords }) => getRecords())
      .then(hydrateFromApi)
      .catch(() => undefined);
  }, [hydrateFromApi]);
  const labResults = useRecordsStore((state) => state.labResults);
  const prescriptions = useRecordsStore((state) => state.prescriptions);

  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [selectedLabResult, setSelectedLabResult] = useState<LabResult | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<RecordsFilterState>(DEFAULT_RECORDS_FILTER);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Structured filters are tab-specific (a "Cardiology" pick doesn't mean
  // anything on the Prescriptions tab), so switching tabs resets them. The
  // search text carries over — a typed query still makes sense elsewhere.
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabKey);
    setFilter(DEFAULT_RECORDS_FILTER);
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      if (!isWithinDatePreset(v.date, filter.datePreset)) return false;
      if (filter.hospital && v.hospital !== filter.hospital) return false;
      if (filter.doctor && v.doctor !== filter.doctor) return false;
      if (filter.type && v.department !== filter.type) return false;
      return matchesQuery(
        [v.department, v.hospital, v.doctor, format(parseISO(v.date), 'MMM d, yyyy')],
        searchQuery
      );
    });
  }, [visits, filter, searchQuery]);

  const filteredLabResults = useMemo(() => {
    return labResults.filter((l) => {
      if (!isWithinDatePreset(l.date, filter.datePreset)) return false;
      if (filter.hospital && l.hospital !== filter.hospital) return false;
      if (filter.doctor && l.orderingDoctor !== filter.doctor) return false;
      if (filter.type && l.testName !== filter.type) return false;
      return matchesQuery(
        [l.testName, l.hospital, l.orderingDoctor, format(parseISO(l.date), 'MMM d, yyyy')],
        searchQuery
      );
    });
  }, [labResults, filter, searchQuery]);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((p) => {
      if (!isWithinDatePreset(p.date, filter.datePreset)) return false;
      if (filter.hospital && p.hospital !== filter.hospital) return false;
      if (filter.doctor && p.prescribingDoctor !== filter.doctor) return false;
      if (filter.type && p.medication !== filter.type) return false;
      return matchesQuery(
        [p.medication, p.hospital, p.prescribingDoctor, format(parseISO(p.date), 'MMM d, yyyy')],
        searchQuery
      );
    });
  }, [prescriptions, filter, searchQuery]);

  const hospitalOptions = useMemo(() => {
    const source =
      activeTab === 'Visits'
        ? visits.map((v) => v.hospital)
        : activeTab === 'Lab Results'
          ? labResults.map((l) => l.hospital)
          : prescriptions.map((p) => p.hospital);
    return uniqueSorted(source);
  }, [activeTab, visits, labResults, prescriptions]);

  const doctorOptions = useMemo(() => {
    const source =
      activeTab === 'Visits'
        ? visits.map((v) => v.doctor)
        : activeTab === 'Lab Results'
          ? labResults.map((l) => l.orderingDoctor)
          : prescriptions.map((p) => p.prescribingDoctor);
    return uniqueSorted(source);
  }, [activeTab, visits, labResults, prescriptions]);

  const typeLabel = activeTab === 'Visits' ? 'Department' : activeTab === 'Lab Results' ? 'Test' : 'Medication';
  const typeOptions = useMemo(() => {
    const source =
      activeTab === 'Visits'
        ? visits.map((v) => v.department)
        : activeTab === 'Lab Results'
          ? labResults.map((l) => l.testName)
          : prescriptions.map((p) => p.medication);
    return uniqueSorted(source);
  }, [activeTab, visits, labResults, prescriptions]);

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

  const searchPlaceholder =
    activeTab === 'Visits'
      ? 'Search visits, hospitals, or doctors...'
      : activeTab === 'Lab Results'
        ? 'Search tests, hospitals, or doctors...'
        : 'Search medications, hospitals, or doctors...';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <IconButton icon="share-outline" />
      </View>

      {/* 2. SEARCH BAR — pinned */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => setFilterSheetVisible(true)}
          filterActive={isFilterActive(filter)}
        />
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
          <MedicalIdBanner onPress={() => router.push('/(screens)/medical-id')} />
        </Animated.View>

        {/* CHILD 1 — tabs stick */}
        <Animated.View style={[styles.tabsContainer, {
          borderBottomColor: tabBorderOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(229,231,235,0)', 'rgba(229,231,235,1)'],
          }),
        }]}>
          <RecordsTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />
        </Animated.View>

        {/* CHILD 2 — records */}
        <View style={styles.cardsWrapper}>
          {activeTab === 'Visits' &&
            (filteredVisits.length === 0 ? (
              <Text style={styles.emptyText}>
                {visits.length === 0 ? 'No visits recorded' : 'No visits match your search or filters'}
              </Text>
            ) : (
              withRecencyDivider(filteredVisits, (v) => v.date).map((row, index) =>
                row.type === 'divider' ? (
                  <Divider key={`divider-${index}`} label={row.label} thickness={2} />
                ) : (
                  <MedicalRecordCard
                    key={row.item.id}
                    department={row.item.department}
                    hospital={row.item.hospital}
                    date={row.item.date}
                    doctor={row.item.doctor}
                    summary={row.item.summary}
                    onPress={() => setSelectedVisit(row.item)}
                  />
                )
              )
            ))}

          {activeTab === 'Lab Results' &&
            (filteredLabResults.length === 0 ? (
              <Text style={styles.emptyText}>
                {labResults.length === 0
                  ? 'No lab results recorded'
                  : 'No lab results match your search or filters'}
              </Text>
            ) : (
              withRecencyDivider(filteredLabResults, (l) => l.date).map((row, index) =>
                row.type === 'divider' ? (
                  <Divider key={`divider-${index}`} label={row.label} thickness={2} />
                ) : (
                  <LabResultCard
                    key={row.item.id}
                    labResult={row.item}
                    onPress={() => setSelectedLabResult(row.item)}
                  />
                )
              )
            ))}

          {activeTab === 'Prescriptions' &&
            (filteredPrescriptions.length === 0 ? (
              <Text style={styles.emptyText}>
                {prescriptions.length === 0
                  ? 'No prescriptions recorded'
                  : 'No prescriptions match your search or filters'}
              </Text>
            ) : (
              withRecencyDivider(filteredPrescriptions, (p) => p.date).map((row, index) =>
                row.type === 'divider' ? (
                  <Divider key={`divider-${index}`} label={row.label} thickness={2} />
                ) : (
                  <PrescriptionCard
                    key={row.item.id}
                    prescription={row.item}
                    onPress={() => setSelectedPrescription(row.item)}
                  />
                )
              )
            ))}
        </View>
      </Animated.ScrollView>

      <VisitDetailSheet visit={selectedVisit} onClose={() => setSelectedVisit(null)} />
      <LabResultDetailSheet labResult={selectedLabResult} onClose={() => setSelectedLabResult(null)} />
      <PrescriptionDetailSheet
        prescription={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
      />
      <RecordsFilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        filter={filter}
        onApply={setFilter}
        hospitalOptions={hospitalOptions}
        doctorOptions={doctorOptions}
        typeLabel={typeLabel}
        typeOptions={typeOptions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 100 },
  bannerWrapper: { paddingHorizontal: 20, paddingBottom: 12 },
  tabsContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: 8, borderBottomWidth: 1 },
  cardsWrapper: { paddingHorizontal: 20, paddingTop: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 24 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { paddingHorizontal: 16, fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1 },
});
