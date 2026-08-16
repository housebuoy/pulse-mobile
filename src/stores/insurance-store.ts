import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Membership number and expiry are sensitive PII. In the real backend this
// record is tenant-scoped and access-controlled per Ghana's Data Protection
// Act, 2012 (Act 843) — only the patient and facilities they check into can
// read it. This mock has no backend, so it's persisted locally only.
export interface InsuranceDetails {
  scheme: string | null;
  membershipNumber: string;
  cardholderName: string;
  expiryDate: string | null; // ISO date, e.g. 2027-01-31
}

interface InsuranceState extends InsuranceDetails {
  cardPhotoUri: string | null; // local file URI — backup only, never primary data
  setInsuranceDetails: (details: InsuranceDetails) => void;
  setCardPhotoUri: (uri: string | null) => void;
}

export const useInsuranceStore = create<InsuranceState>()(
  persist(
    (set) => ({
      scheme: 'NHIS',
      membershipNumber: '',
      cardholderName: 'Kelvin Quarcoo',
      expiryDate: null,
      cardPhotoUri: null,

      setInsuranceDetails: (details) => set(details),
      setCardPhotoUri: (cardPhotoUri) => set({ cardPhotoUri }),
    }),
    {
      name: 'pulse-insurance-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
