import { isMockMode } from '@/lib/use-mock';
import { apiRequest } from '@/lib/api/client';
import { format, parse } from 'date-fns';
import {
  fetchMockAvailability,
  HospitalAvailability,
  DaySlots,
  MockTimeSlot,
} from '@/services/mock/hospital-schedule';

/** Minimal doctor shape needed for the online-booking eligibility check. */
export interface DoctorOption {
  id: number;
  name?: string;
  email?: string | null;
  hospital?: { id?: number | null } | null;
  hospitalId?: number | null;
}

/**
 * Mirrors the backend pickDoctor eligibility rule as far as the patient API
 * exposes it: a doctor is bookable online only if they have an email and are
 * attached to the hospital the department belongs to. (The backend additionally
 * requires a matching DOCTOR-role staff record, which is not visible to the
 * patient API — this is the closest client-side equivalent.)
 */
export function isStaffLinkedDoctor(
  doctor: DoctorOption,
  hospitalId: number | string
): boolean {
  const hid = typeof hospitalId === 'string' ? Number(hospitalId) : hospitalId;
  const docHospitalId = doctor.hospital?.id ?? doctor.hospitalId ?? null;
  return (
    !!doctor.email &&
    doctor.email.trim().length > 0 &&
    docHospitalId != null &&
    Number(docHospitalId) === hid
  );
}

export async function listDepartmentDoctors(departmentId: number | string): Promise<DoctorOption[]> {
  if (isMockMode()) return [];
  const page = await apiRequest<{ content?: DoctorOption[] } | DoctorOption[]>(
    `/departments/${departmentId}/doctors?size=100`
  );
  const rows = Array.isArray(page) ? page : (page.content ?? []);
  return rows;
}

export interface HospitalCard {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: string;
  image: string;
  distanceKm: number | null;
  waitTime: string;
  status: string;
  specialties: string[];
}

export interface DepartmentOption {
  id: number;
  name: string;
  consultationFee: number;
  description: string;
  /** False when the department has no doctors — booking is impossible (backend flag). */
  hasDoctors?: boolean;
}

/** Wire slot time is ISO "09:00"; screens display "09:00 AM". */
export function formatSlotTime(iso: string): string {
  if (!iso) return iso;
  if (/[AP]M/i.test(iso)) return iso;
  try {
    return format(parse(iso.slice(0, 5), 'HH:mm', new Date()), 'hh:mm a');
  } catch {
    return iso;
  }
}

export function slotTimeToIso(display: string): string {
  if (!display) return display;
  if (/^\d{2}:\d{2}$/.test(display)) return display;
  try {
    return format(parse(display, 'hh:mm a', new Date()), 'HH:mm');
  } catch {
    try {
      return format(parse(display, 'h:mm a', new Date()), 'HH:mm');
    } catch {
      return display;
    }
  }
}

function mapSlots(raw: HospitalAvailability): HospitalAvailability {
  const mapDay = (d: DaySlots): DaySlots => ({
    MORNING: d.MORNING.map(mapSlot),
    AFTERNOON: d.AFTERNOON.map(mapSlot),
  });
  const mapSlot = (s: MockTimeSlot): MockTimeSlot => ({
    ...s,
    time: formatSlotTime(s.time),
  });
  const slots: Record<string, DaySlots> = {};
  for (const [k, v] of Object.entries(raw.slots)) {
    slots[k] = mapDay(v);
  }
  return { ...raw, slots };
}

export async function listHospitals(): Promise<HospitalCard[]> {
  if (isMockMode()) {
    return [
      {
        id: '1',
        name: 'KNUST University Hospital',
        location: 'University Road, Kumasi',
        rating: 4.8,
        reviews: '120+',
        image:
          'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2000&auto=format&fit=crop',
        distanceKm: 2.5,
        waitTime: 'Low Wait',
        status: 'Open 24/7',
        specialties: ['General'],
      },
    ];
  }
  return apiRequest('/mobile/hospitals');
}

export async function listDepartments(hospitalId: string): Promise<DepartmentOption[]> {
  if (isMockMode()) {
    return [
      { id: 1, name: 'General OPD', consultationFee: 20, description: '' },
      { id: 2, name: 'Dental Clinic', consultationFee: 35, description: '' },
    ];
  }
  return apiRequest(`/mobile/hospitals/${hospitalId}/departments`);
}

export async function getAvailability(
  departmentId: string | number,
  from: string,
  days = 14
): Promise<HospitalAvailability> {
  if (isMockMode()) {
    return fetchMockAvailability(String(departmentId), new Date(from));
  }
  const raw = await apiRequest<HospitalAvailability>(
    `/mobile/departments/${departmentId}/availability?from=${from}&days=${days}`
  );
  return mapSlots(raw);
}

export async function bookMobile(departmentId: number, date: string, time: string) {
  if (isMockMode()) {
    return { id: 'mock-booking', departmentId, date, time };
  }
  return apiRequest('/bookings/mobile', {
    method: 'POST',
    body: { departmentId, date, time: slotTimeToIso(time) },
  });
}

export async function rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
  if (isMockMode()) return { id: bookingId, newDate, newTime };
  return apiRequest(`/bookings/${bookingId}/reschedule`, {
    method: 'PATCH',
    body: { newDate, newTime: slotTimeToIso(newTime) },
  });
}
