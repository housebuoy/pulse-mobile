import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ProfileIdentity {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  ghanaCard: string;
  address: string;
}

interface ProfileState {
  pushEnabled: boolean;
  identity: ProfileIdentity | null;
  setPushEnabled: (enabled: boolean) => void;
  hydrateFromApi: (identity: ProfileIdentity) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      pushEnabled: false,
      identity: null,
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
      hydrateFromApi: (identity) => set({ identity }),
    }),
    {
      name: 'pulse-profile-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
