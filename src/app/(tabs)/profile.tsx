import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

// Import our new Lego Blocks
import ProfileHeader from '../../components/profile/profile-header';
import SettingsCard from '../../components/profile/settings-card';
import SettingsRow from '../../components/profile/settings-row';
import { useProfileStore } from '@/stores/profile-store';

export default function ProfileScreen() {
  const pushEnabled = useProfileStore((state) => state.pushEnabled);
  const setPushEnabled = useProfileStore((state) => state.setPushEnabled);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={24}  />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <ProfileHeader />

        <SettingsCard title="Health & Family">
          <SettingsRow 
            iconName="medkit-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Medical ID & Vitals" subtitle="Blood group, allergies"
          />
          <SettingsRow 
            iconName="people-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Family & Dependents" rightLabel="2 Linked" rightLabelColor="#6B7280"
          />
          <SettingsRow 
            iconName="shield-checkmark-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Health Insurance" subtitle="(NHIS)" rightLabel="Active - Ends Dec 2026" rightLabelColor="#10B981"
          />
          <SettingsRow 
            iconName="wallet-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Payment Methods & Wallet" rightLabel="GHS 450.00" rightLabelColor="#111827"
            isLast={true}
          />
        </SettingsCard>

        <SettingsCard title="App Settings">
          <SettingsRow 
            iconName="notifications-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Push Notifications"
            isSwitch={true} switchValue={pushEnabled} onSwitchChange={setPushEnabled}
          />
          <SettingsRow 
            iconName="lock-closed-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Security & PIN"
          />
          <SettingsRow 
            iconName="globe-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Language" rightLabel="English"
            isLast={true}
          />
        </SettingsCard>

        <SettingsCard title="Support & Exit">
          <SettingsRow 
            iconName="help-circle-outline" iconBgColor="#DBEAFE" iconColor="#2563EB"
            title="Help & Support"
          />
          <SettingsRow 
            iconName="log-out-outline" iconBgColor="#FEF2F2" iconColor="#DC2626"
            title="Log Out" isDestructive={true}
            isLast={true}
          />
        </SettingsCard>

        <Text style={styles.versionText}>Version 2.4.1 (Build 205)</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Off-white makes the white cards stand out
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  headerIcon: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 20,
  }
});