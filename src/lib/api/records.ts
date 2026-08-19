import { isMockMode } from '@/lib/use-mock';
import { apiRequest } from '@/lib/api/client';
import type { Visit, LabResult, Prescription } from '@/stores/records-store';

export interface MedicalRecords {
  visits: Visit[];
  labResults: LabResult[];
  prescriptions: Prescription[];
}

export async function getRecords(): Promise<MedicalRecords> {
  if (isMockMode()) {
    const { useRecordsStore } = await import('@/stores/records-store');
    const s = useRecordsStore.getState();
    return { visits: s.visits, labResults: s.labResults, prescriptions: s.prescriptions };
  }
  return apiRequest('/patients/me/records');
}
