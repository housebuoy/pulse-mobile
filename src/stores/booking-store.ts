import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BookingState {
  facilityName: string | null;
  facilityLocation: string | null;
  hospitalId: string | null;
  department: string | null;
  departmentId: number | null;
  selectedDate: string | null;
  selectedTime: string | null;
  lastBookingId: string | null;
  setFacility: (name: string, location: string, hospitalId?: string) => void;
  setDepartment: (department: string | null, departmentId?: number | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setLastBookingId: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  facilityName: null,
  facilityLocation: null,
  hospitalId: null,
  department: null,
  departmentId: null,
  selectedDate: null,
  selectedTime: null,
  lastBookingId: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,
      setFacility: (facilityName, facilityLocation, hospitalId) =>
        set({ facilityName, facilityLocation, hospitalId: hospitalId ?? null }),
      setDepartment: (department, departmentId) =>
        set({ department, departmentId: departmentId ?? null }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setSelectedTime: (selectedTime) => set({ selectedTime }),
      setLastBookingId: (lastBookingId) => set({ lastBookingId }),
      reset: () => set(initialState),
    }),
    {
      name: 'pulse-booking-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
