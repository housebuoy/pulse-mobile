import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNowStrict } from 'date-fns';
import { COLORS } from '@/constants/theme';
import { AppNotification, NotificationType, useNotificationsStore } from '@/stores/notifications-store';

const TYPE_ICON: Record<NotificationType, { name: keyof typeof Ionicons.glyphMap; bgColor: string; color: string }> = {
  payment_reminder: { name: 'card-outline', bgColor: '#FEF3C7', color: COLORS.warning },
  queue_update: { name: 'time-outline', bgColor: '#EFF6FF', color: COLORS.primary },
  booking_confirmation: { name: 'checkmark-circle-outline', bgColor: '#DCFCE7', color: '#16A34A' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationsStore((state) => state.notifications);
  const markRead = useNotificationsStore((state) => state.markRead);

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [notifications]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.backButton} />
      </View>

      {sorted.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-outline" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {sorted.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={() => markRead(notification.id)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function NotificationCard({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const icon = TYPE_ICON[notification.type];
  const timeLabel = formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true });

  return (
    <TouchableOpacity
      style={[styles.card, !notification.read && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
          <Ionicons name={icon.name} size={22} color={icon.color} />
        </View>

        <View style={styles.rightContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              {!notification.read && <View style={styles.unreadDot} />}
              <Text style={styles.titleText} numberOfLines={1}>
                {notification.title}
              </Text>
            </View>
            <Text style={styles.timeText}>{timeLabel}</Text>
          </View>

          <Text style={styles.bodyText}>{notification.body}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#F8FAFF',
    borderColor: '#DBEAFE',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rightContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
