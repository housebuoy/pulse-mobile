import { apiRequest } from '@/lib/api/client';

export interface PatientNotification {
  id: string;
  type: 'appointment';
  title: string;
  body: string;
  createdAt: string; // ISO datetime
  read: boolean;
  link: string | null;
}

/**
 * Live-only: the backend is the source of truth for patient notifications.
 * (No mock layer — the seeds in notifications-store exist only for mock mode.)
 */
export async function getNotifications(): Promise<PatientNotification[]> {
  return apiRequest<PatientNotification[]>('/patients/me/notifications');
}

export async function getUnreadCount(): Promise<number> {
  const { count } = await apiRequest<{ count: number }>('/patients/me/notifications/unread-count');
  return count;
}

/** Marks one notification read; returns the full refreshed feed. */
export async function markNotificationRead(id: string): Promise<PatientNotification[]> {
  return apiRequest<PatientNotification[]>(`/patients/me/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

/** Marks everything read; returns the full refreshed feed. */
export async function markAllNotificationsRead(): Promise<PatientNotification[]> {
  return apiRequest<PatientNotification[]>('/patients/me/notifications/read-all', {
    method: 'POST',
  });
}
