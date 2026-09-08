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
  departmentName: string;
  doctorName: string;
  scheduledAt: string; // ISO datetime
  status: AppointmentStatus;
  paymentStatus: AppointmentPaymentStatus;
}

/** Live-only: the backend is the source of truth for patient bookings. */
export async function getAppointments(): Promise<PatientAppointment[]> {
  return apiRequest<PatientAppointment[]>('/patients/me/appointments');
}
