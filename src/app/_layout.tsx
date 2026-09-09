import { Stack } from 'expo-router';
import '../../global.css';
import ToastProvider from '@/components/ui/toast-provider';
import NotificationsPoller from '@/components/ui/notifications-poller';

export default function RootLayout() {
  return (
    <ToastProvider>
      <NotificationsPoller />
      <Stack screenOptions={{ headerShown: false }} />
    </ToastProvider>
  );
}
