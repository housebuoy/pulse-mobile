import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// PAY-AS-YOU-GO, booking-fee only. A booking is confirmed without instant
// payment — it gets a PAY-BY deadline and shows up here as outstanding until
// the patient pays.
//
// BACKEND_SPEC: this app only displays the pay-by countdown and may fire a
// local reminder notification as it approaches. The actual deadline
// auto-cancel + slot release must be enforced server-side (a client can be
// closed, offline, or have its clock wrong). The backend is the source of
// truth for whether a slot was released — this store never removes an
// outstanding booking on its own just because a deadline passed.
export interface OutstandingBooking {
  id: string;
  facilityName: string;
  department: string;
  appointmentDate: string; // ISO date of the appointment itself
  feeAmount: number; // GHS
  payByDeadline: string; // ISO datetime
}

export type PaymentNetwork = 'mtn_momo' | 'telecel_cash' | 'card';

// SAVE ONLY REFERENCES/TOKENS — never a raw card number, MoMo number, PIN, or
// CVV. `last4` is purely a display aid the patient typed in to recognize the
// method later; `gatewayToken` stands in for what a real gateway SDK
// (Paystack/Hubtel/Flutterwave) would hand back after tokenizing the
// instrument. Nothing sensitive ever touches this store.
export interface PaymentMethod {
  id: string;
  network: PaymentNetwork;
  label: string; // e.g. "MTN MoMo •••• 4567"
  last4: string;
  gatewayToken: string;
  isDefault: boolean;
}

export interface PaymentHistoryEntry {
  id: string;
  facilityName: string;
  department: string;
  methodLabel: string;
  paidDate: string; // ISO datetime
  amount: number;
}

interface PaymentsState {
  outstandingBookings: OutstandingBooking[];
  paymentMethods: PaymentMethod[];
  paymentHistory: PaymentHistoryEntry[];

  addPaymentMethod: (network: PaymentNetwork, last4: string, brand?: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  removePaymentMethod: (id: string) => void;

  // MOCK — marks the given bookings paid locally and files them in history.
  // A real integration initiates a gateway charge and only updates state
  // once a webhook/callback confirms the charge succeeded.
  payBookings: (bookingIds: string[], methodId: string) => void;
}

const makeId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
const makeMockToken = () =>
  `tok_mock_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const NETWORK_LABEL: Record<PaymentNetwork, string> = {
  mtn_momo: 'MTN MoMo',
  telecel_cash: 'Telecel Cash',
  card: 'Card',
};

const inDays = (days: number, hours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export const usePaymentsStore = create<PaymentsState>()(
  persist(
    (set, get) => ({
      outstandingBookings: [
        {
          id: 'seed-booking-1',
          facilityName: 'KNUST University Hospital',
          department: 'General OPD',
          appointmentDate: inDays(2),
          feeAmount: 20,
          payByDeadline: inDays(1),
        },
        {
          id: 'seed-booking-2',
          facilityName: 'Cosmopolitan Health Clinic',
          department: 'Dental Clinic',
          appointmentDate: inDays(5),
          feeAmount: 35,
          payByDeadline: inDays(4),
        },
      ],
      paymentMethods: [
        {
          id: 'seed-method-1',
          network: 'mtn_momo',
          label: 'MTN MoMo •••• 4567',
          last4: '4567',
          gatewayToken: makeMockToken(),
          isDefault: true,
        },
      ],
      paymentHistory: [
        {
          id: 'seed-history-1',
          facilityName: 'KNUST University Hospital',
          department: 'General OPD',
          methodLabel: 'MTN MoMo •••• 4567',
          paidDate: inDays(-14),
          amount: 20,
        },
      ],

      addPaymentMethod: (network, last4, brand) =>
        set((state) => {
          const labelPrefix = network === 'card' ? brand || 'Card' : NETWORK_LABEL[network];
          const method: PaymentMethod = {
            id: makeId(),
            network,
            label: `${labelPrefix} •••• ${last4}`,
            last4,
            gatewayToken: makeMockToken(),
            isDefault: state.paymentMethods.length === 0,
          };
          return { paymentMethods: [...state.paymentMethods, method] };
        }),

      setDefaultPaymentMethod: (id) =>
        set((state) => ({
          paymentMethods: state.paymentMethods.map((m) => ({ ...m, isDefault: m.id === id })),
        })),

      removePaymentMethod: (id) =>
        set((state) => {
          const remaining = state.paymentMethods.filter((m) => m.id !== id);
          const removedWasDefault = state.paymentMethods.find((m) => m.id === id)?.isDefault;
          if (removedWasDefault && remaining.length > 0) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return { paymentMethods: remaining };
        }),

      payBookings: (bookingIds, methodId) => {
        const state = get();
        const method = state.paymentMethods.find((m) => m.id === methodId);
        if (!method) return;
        const now = new Date().toISOString();
        const paidEntries: PaymentHistoryEntry[] = state.outstandingBookings
          .filter((b) => bookingIds.includes(b.id))
          .map((b) => ({
            id: makeId(),
            facilityName: b.facilityName,
            department: b.department,
            methodLabel: method.label,
            paidDate: now,
            amount: b.feeAmount,
          }));
        set({
          outstandingBookings: state.outstandingBookings.filter((b) => !bookingIds.includes(b.id)),
          paymentHistory: [...paidEntries, ...state.paymentHistory],
        });
      },
    }),
    {
      name: 'pulse-payments-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const formatGHS = (amount: number) => `GH₵ ${amount.toFixed(2)}`;
