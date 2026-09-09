import { isMockMode } from '@/lib/use-mock';
import { apiRequest } from '@/lib/api/client';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface PatientAppointment {
  id: string;
  reference: string;
  hospitalName?: string | null;
  departmentName: string;
  doctorName: string;
  scheduledAt: string; // ISO datetime
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;
  // Backend wave-2: patient appointments now carry the ids of the department
  // and hospital the booking belongs to, so the client can open Reschedule
  // with exact context instead of guessing from the booking store.
  departmentId?: number;
  hospitalId?: number;
}

/** Live-only: the backend is the source of truth for patient bookings. */
export async function getAppointments(): Promise<PatientAppointment[]> {
  return apiRequest<PatientAppointment[]>('/patients/me/appointments');
}

/**
 * Patient-initiated booking cancellation (DELETE /bookings/{id}). The next
 * appointments poll drops the row (cancelled is not an UPCOMING status).
 */
export async function cancelBooking(bookingId: string) {
  if (isMockMode()) return { id: bookingId, status: 'cancelled' as const };
  return apiRequest(`/bookings/${bookingId}`, { method: 'DELETE' });
}
