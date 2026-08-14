import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface QueueTicket {
  hospitalName: string;
  department: string;
  doctorName: string;
  currentNumber: number;
  userNumber: number;
  waitTimeMins: number;
  roomNumber: string;
  estimatedTime: string;
}

interface QueueState {
  ticket: QueueTicket;
  setTicket: (ticket: QueueTicket) => void;
}

// Seeded with today's demo ticket so both Home and Queue render the same
// values they did before this store existed.
const DEFAULT_TICKET: QueueTicket = {
  hospitalName: 'KNUST University Hospital',
  department: 'General OPD',
  doctorName: 'Dr. Arhin',
  currentNumber: 4,
  userNumber: 12,
  waitTimeMins: 45,
  roomNumber: '302',
  estimatedTime: '10:15 AM',
};

export const useQueueStore = create<QueueState>()(
  persist(
    (set) => ({
      ticket: DEFAULT_TICKET,
      setTicket: (ticket) => set({ ticket }),
    }),
    {
      name: 'pulse-queue-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
