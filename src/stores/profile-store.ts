import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProfileState {
  pushEnabled: boolean;
  setPushEnabled: (enabled: boolean) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      pushEnabled: false,
      setPushEnabled: (pushEnabled) => set({ pushEnabled }),
    }),
    {
      name: 'pulse-profile-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
