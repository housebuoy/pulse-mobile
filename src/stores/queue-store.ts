import { create } from 'zustand';

export interface QueueTicket {
  hospitalName: string;
  department: string;
  doctorName: string;
  currentNumber: number;
  userNumber: number;
  waitTimeMins: number;
  roomNumber: string;
  estimatedTime: string;
  // Live-queue position + booking link (backend QueueTicketResponse).
  // Optional so an older backend payload (pre-deploy) still parses.
  bookingId?: number | null;
  bookingReference?: string | null;
  queueTotal?: number;
  aheadCount?: number;
  servedCount?: number;
}

interface QueueState {
  ticket: QueueTicket;
  setTicket: (ticket: QueueTicket) => void;
  clearTicket: () => void;
}

// Empty ticket = "no active queue". Screens treat an empty hospitalName as
// the inactive state (hasActiveQueue). NOT persisted: a live ticket is
// ephemeral state that refetches every poll, and persisting it caused stale
// cards from a previous login/session to linger after the backend stopped
// returning a ticket (the KNUST/Dr. Boateng card on Marvinphil's Home).
const EMPTY_TICKET: QueueTicket = {
  hospitalName: '',
  department: '',
  doctorName: '',
  currentNumber: 0,
  userNumber: 0,
  waitTimeMins: 0,
  roomNumber: '',
  estimatedTime: '',
};

export const useQueueStore = create<QueueState>()((set) => ({
  ticket: EMPTY_TICKET,
  setTicket: (ticket) => set({ ticket }),
  clearTicket: () => set({ ticket: EMPTY_TICKET }),
}));
