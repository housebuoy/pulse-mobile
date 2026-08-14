import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BookingState {
  facilityName: string | null;
  facilityLocation: string | null;
  department: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  setFacility: (name: string, location: string) => void;
  setDepartment: (department: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  reset: () => void;
}

const initialState = {
  facilityName: null,
  facilityLocation: null,
  department: null,
  selectedDate: null,
  selectedTime: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,
      setFacility: (facilityName, facilityLocation) => set({ facilityName, facilityLocation }),
      setDepartment: (department) => set({ department }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setSelectedTime: (selectedTime) => set({ selectedTime }),
      reset: () => set(initialState),
    }),
    {
      name: 'pulse-booking-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
