import { create } from 'zustand';

export type NotificationType = 'appointment' | 'queue' | (string & {});

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO datetime
  read: boolean;
  link?: string | null;
}

interface NotificationsState {
  notifications: AppNotification[];
  /** Unread count from the backend (/notifications/unread-count); -1 = not fetched yet. */
  unreadCount: number;
  /** Optimistic local flip; backend is source of truth and re-hydrates on focus. */
  markRead: (id: string) => void;
  /** Backend-backed: PATCHes then hydrates the returned full feed. */
  markReadRemote: (id: string) => Promise<void>;
  /** Backend-backed: POSTs read-all then hydrates the returned full feed. */
  markAllReadRemote: () => Promise<void>;
  hydrateFromApi: (notifications: AppNotification[]) => void;
  /** Fetches GET /notifications/unread-count and stores the backend count. */
  syncUnreadCount: () => Promise<void>;
}

const countUnread = (notifications: AppNotification[]) =>
  notifications.filter((n) => !n.read).length;

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  unreadCount: -1,

  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { notifications, unreadCount: countUnread(notifications) };
    }),

  markReadRemote: async (id) => {
    // Optimistic flip for instant UI feedback, then reconcile with the server.
    set((state) => {
      const notifications = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { notifications, unreadCount: countUnread(notifications) };
    });
    try {
      const { markNotificationRead } = await import('@/lib/api/notifications');
      const feed = await markNotificationRead(id);
      set({ notifications: feed, unreadCount: countUnread(feed) });
    } catch {
      /* keep optimistic state */
    }
  },

  markAllReadRemote: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
    try {
      const { markAllNotificationsRead } = await import('@/lib/api/notifications');
      const feed = await markAllNotificationsRead();
      set({ notifications: feed, unreadCount: countUnread(feed) });
    } catch {
      /* keep optimistic state */
    }
  },

  hydrateFromApi: (notifications) =>
    set({ notifications, unreadCount: countUnread(notifications) }),

  syncUnreadCount: async () => {
    try {
      const { getUnreadCount } = await import('@/lib/api/notifications');
      set({ unreadCount: await getUnreadCount() });
    } catch {
      /* keep last known count */
    }
  },
}));

export const selectUnreadCount = (state: NotificationsState) =>
  state.unreadCount >= 0 ? state.unreadCount : countUnread(state.notifications);
