import {
  getProfile,
  getMedical,
  getInsurance,
  getOutstanding,
  getPaymentMethods,
  getPaymentHistory,
} from '@/lib/api/patient';
import { getMyTicket } from '@/lib/api/queue';
import { getRecords } from '@/lib/api/records';
import { useProfileStore } from '@/stores/profile-store';
import { useMedicalStore } from '@/stores/medical-store';
import { useInsuranceStore } from '@/stores/insurance-store';
import { useQueueStore } from '@/stores/queue-store';
import { usePaymentsStore } from '@/stores/payments-store';
import { useRecordsStore } from '@/stores/records-store';

/** Pull live (or mock) data into Zustand after login. Failures leave seeds. */
export async function hydrateAfterLogin(): Promise<void> {
  try {
    const [profile, medical] = await Promise.all([getProfile(), getMedical()]);
    useProfileStore.getState().hydrateFromApi(profile);
    useMedicalStore.getState().hydrateFromApi({
      ...medical,
      emergencyContact: profile.emergencyContact ?? useMedicalStore.getState().emergencyContact,
    });
  } catch {
    // keep seeds
  }

  try {
    const ins = await getInsurance();
    useInsuranceStore.getState().setInsuranceDetails(ins);
    useInsuranceStore.getState().setCardPhotoUri(ins.cardPhotoUri);
  } catch {
    /* keep seeds */
  }

  try {
    const ticket = await getMyTicket();
    if (ticket) useQueueStore.getState().setTicket(ticket);
  } catch {
    /* keep seeds */
  }

  try {
    const [outstanding, methods, history] = await Promise.all([
      getOutstanding(),
      getPaymentMethods(),
      getPaymentHistory(),
    ]);
    usePaymentsStore.getState().hydrateFromApi({ outstanding, methods, history });
  } catch {
    /* keep seeds */
  }

  try {
    const records = await getRecords();
    useRecordsStore.getState().hydrateFromApi(records);
  } catch {
    /* keep seeds */
  }
}
