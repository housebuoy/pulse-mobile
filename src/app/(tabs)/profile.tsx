import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/theme';

// Import our new Lego Blocks
import ProfileHeader from '../../components/profile/profile-header';
import SettingsCard from '../../components/profile/settings-card';
import SettingsRow from '../../components/profile/settings-row';
import { useProfileStore } from '@/stores/profile-store';
import { clearToken } from '@/lib/api/client';

export default function ProfileScreen() {
  const router = useRouter();
  const pushEnabled = useProfileStore((state) => state.pushEnabled);
  const setPushEnabled = useProfileStore((state) => state.setPushEnabled);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearToken();
          } finally {
            // Replace (not push) so the back button can't return to the
            // logged-in screens after the token is gone (bug-triage FE-9).
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ProfileHeader />

        <SettingsCard title="Health & Family">
          <SettingsRow
            iconName="medkit-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Medical ID & Vitals"
            onPress={() => router.push('/(screens)/medical-id')}
          />
          <SettingsRow
            iconName="people-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Family & Dependents"
          />
          <SettingsRow
            iconName="shield-checkmark-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Health Insurance"
            onPress={() => router.push('/(screens)/health-insurance')}
          />
          <SettingsRow
            iconName="wallet-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Wallet & Payments"
            onPress={() => router.push('/(screens)/payments')}
            isLast={true}
          />
        </SettingsCard>

        <SettingsCard title="App Settings">
          <SettingsRow
            iconName="notifications-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Push Notifications"
            isSwitch={true}
            switchValue={pushEnabled}
            onSwitchChange={setPushEnabled}
          />
          <SettingsRow
            iconName="lock-closed-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Security & PIN"
          />
          <SettingsRow
            iconName="globe-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Language"
            isLast={true}
          />
        </SettingsCard>

        <SettingsCard title="Support & Exit">
          <SettingsRow
            iconName="help-circle-outline"
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
            title="Help & Support"
          />
          <SettingsRow
            iconName="log-out-outline"
            iconBgColor="#FEF2F2"
            iconColor="#DC2626"
            title="Log Out"
            isDestructive={true}
            isLast={true}
            onPress={handleLogout}
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
  },
});
