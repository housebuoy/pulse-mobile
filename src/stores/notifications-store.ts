import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NotificationType = 'payment_reminder' | 'queue_update' | 'booking_confirmation';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO datetime
  read: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  hydrateFromApi: (notifications: AppNotification[]) => void;
}

const hoursFromNow = (hours: number) => {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: 'seed-notif-1',
          type: 'payment_reminder',
          title: 'Payment due soon',
          body: 'Pay for your KNUST University Hospital booking before 8:00 AM tomorrow or your slot is released.',
          createdAt: hoursFromNow(-1),
          read: false,
        },
        {
          id: 'seed-notif-2',
          type: 'queue_update',
          title: 'Queue update',
          body: "You're 2 patients away in the General OPD queue at KNUST University Hospital.",
          createdAt: hoursFromNow(-3),
          read: false,
        },
        {
          id: 'seed-notif-3',
          type: 'booking_confirmation',
          title: 'Booking confirmed',
          body: 'Your appointment with Dr. Arhin at KNUST University Hospital is confirmed for Oct 28, 09:00 AM.',
          createdAt: hoursFromNow(-30),
          read: true,
        },
      ],

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      hydrateFromApi: (notifications) => set({ notifications }),
    }),
    {
      name: 'pulse-notifications-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const selectUnreadCount = (state: NotificationsState) =>
  state.notifications.filter((n) => !n.read).length;
