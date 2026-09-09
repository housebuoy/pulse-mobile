import { useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TOKEN_KEY } from '@/lib/api/client';
import { useToast } from '@/components/ui/toast-provider';
import { useNotificationsStore } from '@/stores/notifications-store';

const POLL_INTERVAL_MS = 7000;
const NOTIFICATIONS_ROUTE = '/(screens)/notifications';

/**
 * Mounted once at the app root inside <ToastProvider> (see app/_layout.tsx).
 * While the app is foregrounded and a patient session exists, polls the
 * notification feed every ~7s and surfaces brand-new UNREAD entries as toasts
 * (doctor calling the patient = type 'queue', consult completed = 'appointment').
 *
 * The notifications screen and the home/queue bells keep their focus-based
 * refresh — this poller only adds the live toast between those refreshes, so
 * an alert appears even when the patient is on another tab/screen.
 */
export default function NotificationsPoller() {
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    let disposed = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let polling = false;

    const poll = async () => {
      if (polling) return; // never overlap ticks on slow networks
      polling = true;
      try {
        // Cheap gate: never fetch before a patient session exists (login/onboarding).
        let token: string | null = null;
        try {
          token = await AsyncStorage.getItem(TOKEN_KEY);
        } catch {
          token = null;
        }
        if (!token || disposed) return;

        const knownIds = new Set(useNotificationsStore.getState().notifications.map((n) => n.id));
        const { getNotifications } = await import('@/lib/api/notifications');
        const feed = await getNotifications();
        if (disposed) return;

        // A cold start (or fresh login) has an empty feed in the store — treat
        // the first successful fetch as a baseline so historical unread items
        // don't all toast at once; only *new* arrivals since the last fetch do.
        const isBaseline = knownIds.size === 0;
        if (!isBaseline) {
          feed
            .filter((n) => !n.read && !knownIds.has(n.id))
            .forEach((n) => {
              show({
                title: n.title,
                body: n.body,
                variant: n.type === 'queue' ? 'success' : 'info',
                vibrate: true,
                onPress: () => router.push(NOTIFICATIONS_ROUTE),
              });
            });
        }
        // Full replace (after queueing toasts) keeps the feed and the unread
        // bell badges in sync with the backend.
        useNotificationsStore.getState().hydrateFromApi(feed);
      } catch {
        // Transient failure — incl. 401, which client.ts already routes to
        // login. Keep whatever feed/unread state we already have.
      } finally {
        polling = false;
      }
    };

    const start = () => {
      if (intervalId) return;
      void poll(); // one poll immediately, then on the interval
      intervalId = setInterval(() => void poll(), POLL_INTERVAL_MS);
    };
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Poll only while foregrounded: background timers are throttled anyway and
    // we don't want to keep waking the radio. On resume ('active') we restart
    // and poll immediately so a toast fires as soon as the app reopens.
    if (AppState.currentState === 'active') start();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') start();
      else stop();
    });

    return () => {
      disposed = true;
      stop();
      sub.remove();
    };
  }, [router, show]);

  return null;
}
