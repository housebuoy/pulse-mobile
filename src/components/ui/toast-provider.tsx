import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Vibration } from 'react-native';
import { ToastBanner, ToastVariant } from './toast-banner';

export interface ToastInput {
  title?: string;
  body?: string;
  variant?: ToastVariant;
  onPress?: () => void;
  /** Buzz the device when the toast appears (used for live alerts). */
  vibrate?: boolean;
}

interface QueuedToast extends ToastInput {
  id: number;
}

interface ToastContextValue {
  /** Queue a toast. Toasts show one at a time; each auto-dismisses after ~3.5s. */
  show: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used within a <ToastProvider>');
  return value;
}

const AUTO_DISMISS_MS = 3500;

// Module-level counter: toast ids only need to be unique within the app run.
let nextToastId = 1;

/**
 * Global toast host. Mount once around the root <Stack> (see app/_layout.tsx);
 * any screen (or mounted component such as the notifications poller) can call
 * useToast().show() and get a floating ToastBanner that auto-dismisses.
 * Reuses the existing ToastBanner look/behavior — this only manages the queue.
 */
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);
  const current = toasts[0] ?? null;

  // Remove the head of the queue only if it is still the head — guards against
  // a stale auto-dismiss timer racing a manual dismiss and skipping a toast.
  const advance = useCallback((id: number) => {
    setToasts((list) => (list[0]?.id === id ? list.slice(1) : list));
  }, []);

  // Auto-dismiss head after its display window. The timer restarts whenever
  // the head changes, so every queued toast gets its full 3.5s.
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => advance(current.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [current, advance]);

  const show = useCallback((toast: ToastInput) => {
    if (toast.vibrate) {
      // Haptic attention-getter for live alerts (doctor calling, results in).
      Vibration.vibrate(300);
    }
    const id = nextToastId++;
    setToasts((list) => [...list, { ...toast, id }]);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {current && (
          <View pointerEvents="box-none" style={styles.overlay}>
            <ToastBanner
              key={current.id}
              variant={current.variant ?? 'info'}
              title={current.title ?? 'Notification'}
              message={current.body ?? ''}
              onDismiss={() => advance(current.id)}
              onPress={
                current.onPress
                  ? () => {
                      current.onPress?.();
                      advance(current.id);
                    }
                  : undefined
              }
              floating
              duration={AUTO_DISMISS_MS}
            />
          </View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
});
