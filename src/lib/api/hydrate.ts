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

/**
 * Pull live (or mock) data into Zustand after login. Failures leave seeds.
 *
 * Performance (bug-triage FE-26): ALL store groups are fetched in ONE
 * concurrent round — previously 5 sequential rounds of API calls (profile+medical
 * → insurance → ticket → payments → records) added ~3–5s of serial latency to
 * every sign-in. Promise.allSettled keeps one group's failure from blocking the
 * others (same semantics as the old per-group try/catch).
 */
export async function hydrateAfterLogin(): Promise<void> {
  const [profileRes, medicalRes, insuranceRes, ticketRes, paymentsRes, recordsRes] =
    await Promise.allSettled([
      getProfile(),
      getMedical(),
      getInsurance(),
      getMyTicket(),
      Promise.all([getOutstanding(), getPaymentMethods(), getPaymentHistory()]),
      getRecords(),
    ]);

  if (profileRes.status === 'fulfilled' && medicalRes.status === 'fulfilled') {
    const profile = profileRes.value;
    const medical = medicalRes.value;
    useProfileStore.getState().hydrateFromApi(profile);
    useMedicalStore.getState().hydrateFromApi({
      ...medical,
      emergencyContact: profile.emergencyContact ?? useMedicalStore.getState().emergencyContact,
    });
  }

  if (insuranceRes.status === 'fulfilled') {
    const ins = insuranceRes.value;
    useInsuranceStore.getState().setInsuranceDetails(ins);
    useInsuranceStore.getState().setCardPhotoUri(ins.cardPhotoUri);
  }

  if (ticketRes.status === 'fulfilled') {
    const ticket = ticketRes.value;
    if (ticket) useQueueStore.getState().setTicket(ticket);
  }

  if (paymentsRes.status === 'fulfilled') {
    const [outstanding, methods, history] = paymentsRes.value;
    usePaymentsStore.getState().hydrateFromApi({ outstanding, methods, history });
  }

  if (recordsRes.status === 'fulfilled') {
    useRecordsStore.getState().hydrateFromApi(recordsRes.value);
  }
}
