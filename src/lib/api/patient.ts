import { isMockMode } from '@/lib/use-mock';
import { apiRequest } from '@/lib/api/client';
import type {
  EmergencyContact,
  AllergyEntry,
  ConditionEntry,
  MedicationEntry,
  VitalsEntry,
} from '@/stores/medical-store';
import type { InsuranceDetails } from '@/stores/insurance-store';
import type {
  OutstandingBooking,
  PaymentMethod,
  PaymentHistoryEntry,
} from '@/stores/payments-store';

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  ghanaCard: string;
  address: string;
  emergencyContact: EmergencyContact | null;
}

export interface MedicalProfile {
  bloodGroup: string | null;
  allergies: AllergyEntry[];
  conditions: ConditionEntry[];
  medications: MedicationEntry[];
  vitals: VitalsEntry[];
}

const MOCK_PROFILE: PatientProfile = {
  id: 'PT-00101',
  firstName: 'Kwame',
  lastName: 'Mensah',
  dateOfBirth: '1985-03-14',
  gender: 'male',
  email: 'kwame.mensah@pulsehealth.test',
  phone: '+233 24 111 0001',
  ghanaCard: 'GHA-123456789-0',
  address: 'Kumasi',
  emergencyContact: {
    name: 'Ama Quarcoo',
    relationship: 'Sister',
    phone: '+233 20 987 6543',
  },
};

export async function getProfile(): Promise<PatientProfile> {
  if (isMockMode()) return MOCK_PROFILE;
  return apiRequest<PatientProfile>('/patients/me');
}

export async function patchProfile(
  body: Partial<PatientProfile> & { emergencyContact?: EmergencyContact }
): Promise<PatientProfile> {
  if (isMockMode()) return { ...MOCK_PROFILE, ...body };
  return apiRequest<PatientProfile>('/patients/me', { method: 'PATCH', body });
}

export async function getMedical(): Promise<MedicalProfile> {
  if (isMockMode()) {
    return {
      bloodGroup: 'O+',
      allergies: [{ id: '1', label: 'Penicillin', type: 'drug' }],
      conditions: [{ id: '1', label: 'Asthma' }],
      medications: [{ id: '1', name: 'Ventolin Inhaler', dose: '100mcg, as needed' }],
      vitals: [],
    };
  }
  return apiRequest<MedicalProfile>('/patients/me/medical');
}

export async function patchMedical(body: Partial<MedicalProfile>): Promise<MedicalProfile> {
  if (isMockMode()) return getMedical();
  return apiRequest<MedicalProfile>('/patients/me/medical', { method: 'PATCH', body });
}

export async function addVitals(entry: Omit<VitalsEntry, 'id' | 'date'>): Promise<MedicalProfile> {
  if (isMockMode()) return getMedical();
  return apiRequest<MedicalProfile>('/patients/me/vitals', { method: 'POST', body: entry });
}

export async function getInsurance(): Promise<InsuranceDetails & { cardPhotoUri: string | null }> {
  if (isMockMode()) {
    return {
      scheme: 'NHIS',
      membershipNumber: 'NHIS-00101-2026',
      cardholderName: 'Kwame Mensah',
      expiryDate: '2027-01-31',
      cardPhotoUri: null,
    };
  }
  return apiRequest('/patients/me/insurance');
}

export async function putInsurance(details: InsuranceDetails & { cardPhotoUri?: string | null }) {
  if (isMockMode()) return { ...details, cardPhotoUri: details.cardPhotoUri ?? null };
  return apiRequest('/patients/me/insurance', { method: 'PUT', body: details });
}

export async function uploadImage(uri: string, name = 'photo.jpg'): Promise<{ url: string }> {
  if (isMockMode()) return { url: uri };
  const form = new FormData();
  form.append('file', { uri, name, type: 'image/jpeg' } as unknown as Blob);
  return apiRequest('/uploads/images', { method: 'POST', body: form });
}

export async function getOutstanding(): Promise<OutstandingBooking[]> {
  if (isMockMode()) {
    const { usePaymentsStore } = await import('@/stores/payments-store');
    return usePaymentsStore.getState().outstandingBookings;
  }
  const rows = await apiRequest<OutstandingBooking[]>('/patients/me/outstanding');
  return rows.map((r) => ({
    ...r,
    feeAmount: Number(r.feeAmount),
  }));
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (isMockMode()) {
    const { usePaymentsStore } = await import('@/stores/payments-store');
    return usePaymentsStore.getState().paymentMethods;
  }
  return apiRequest('/patients/me/payment-methods');
}

export async function getPaymentHistory(): Promise<PaymentHistoryEntry[]> {
  if (isMockMode()) {
    const { usePaymentsStore } = await import('@/stores/payments-store');
    return usePaymentsStore.getState().paymentHistory;
  }
  const rows = await apiRequest<PaymentHistoryEntry[]>('/patients/me/payment-history');
  return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
}

export async function startCheckout(
  bookingIds: string[],
  methodId: string
): Promise<{ checkoutUrl: string; sessionId: string }> {
  if (isMockMode()) {
    return { checkoutUrl: 'https://pay.aza.systems/c/mock', sessionId: 'cs_mock' };
  }
  return apiRequest('/patients/me/payments', {
    method: 'POST',
    body: {
      bookingIds: bookingIds.map((id) => Number(id)),
      methodId: Number(methodId),
    },
  });
}
