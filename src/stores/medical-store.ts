import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AllergyType = 'drug' | 'food' | 'environmental';

export interface AllergyEntry {
  id: string;
  label: string;
  type: AllergyType;
}

export interface ConditionEntry {
  id: string;
  label: string;
}

export interface MedicationEntry {
  id: string;
  name: string;
  dose: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

// A single recorded checkup. Every field is optional — a patient may only
// note a blood pressure reading one day and a weight the next.
export interface VitalsEntry {
  id: string;
  date: string; // ISO date, e.g. 2026-08-15
  systolic?: string;
  diastolic?: string;
  pulseBpm?: string;
  temperatureC?: string;
  heightCm?: string;
  weightKg?: string;
}

interface MedicalState {
  bloodGroup: string | null;
  allergies: AllergyEntry[];
  conditions: ConditionEntry[];
  medications: MedicationEntry[];
  emergencyContact: EmergencyContact;
  vitals: VitalsEntry[];

  setBloodGroup: (bloodGroup: string) => Promise<void>;

  addAllergy: (label: string, type: AllergyType) => Promise<void>;
  removeAllergy: (id: string) => Promise<void>;

  addCondition: (label: string) => Promise<void>;
  removeCondition: (id: string) => Promise<void>;

  addMedication: (name: string, dose: string) => Promise<void>;
  updateMedication: (id: string, name: string, dose: string) => Promise<void>;
  removeMedication: (id: string) => Promise<void>;

  setEmergencyContact: (contact: EmergencyContact) => Promise<void>;

  addVitalsEntry: (entry: Omit<VitalsEntry, 'id' | 'date'>) => Promise<void>;
  removeVitalsEntry: (id: string) => void;

  hydrateFromApi: (data: {
    bloodGroup?: string | null;
    allergies?: AllergyEntry[];
    conditions?: ConditionEntry[];
    medications?: MedicationEntry[];
    vitals?: VitalsEntry[];
    emergencyContact?: EmergencyContact;
  }) => void;
}

const makeId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
const todayIso = () => new Date().toISOString().split('T')[0];

/** Persist the full medical profile to the backend; returns the server copy. */
async function persistMedical() {
  const { useMedicalStore: store } = await import('@/stores/medical-store');
  const s = store.getState();
  const { patchMedical } = await import('@/lib/api/patient');
  return patchMedical({
    bloodGroup: s.bloodGroup,
    allergies: s.allergies,
    conditions: s.conditions,
    medications: s.medications,
  });
}

// Seeded with a light demo profile so the screen isn't empty on first open,
// matching how the queue/profile stores ship with a demo record.
export const useMedicalStore = create<MedicalState>()(
  persist(
    (set, get) => ({
      bloodGroup: 'O+',
      allergies: [{ id: 'seed-allergy-1', label: 'Penicillin', type: 'drug' }],
      conditions: [{ id: 'seed-condition-1', label: 'Asthma' }],
      medications: [
        { id: 'seed-medication-1', name: 'Ventolin Inhaler', dose: '100mcg, as needed' },
      ],
      emergencyContact: {
        name: 'Ama Quarcoo',
        relationship: 'Sister',
        phone: '+233 20 987 6543',
      },
      vitals: [
        {
          id: 'seed-vitals-1',
          date: todayIso(),
          systolic: '120',
          diastolic: '80',
          pulseBpm: '72',
          temperatureC: '36.8',
          heightCm: '178',
          weightKg: '74',
        },
      ],

      setBloodGroup: async (bloodGroup) => {
        const prev = get().bloodGroup;
        set({ bloodGroup });
        try {
          await persistMedical();
        } catch (e) {
          set({ bloodGroup: prev });
          throw e;
        }
      },

      addAllergy: async (label, type) => {
        const prev = get().allergies;
        set((state) => ({ allergies: [...state.allergies, { id: makeId(), label, type }] }));
        try {
          const updated = await persistMedical();
          if (updated.allergies) set({ allergies: updated.allergies });
        } catch (e) {
          set({ allergies: prev });
          throw e;
        }
      },
      removeAllergy: async (id) => {
        const prev = get().allergies;
        set((state) => ({ allergies: state.allergies.filter((a) => a.id !== id) }));
        try {
          const updated = await persistMedical();
          if (updated.allergies) set({ allergies: updated.allergies });
        } catch (e) {
          set({ allergies: prev });
          throw e;
        }
      },

      addCondition: async (label) => {
        const prev = get().conditions;
        set((state) => ({ conditions: [...state.conditions, { id: makeId(), label }] }));
        try {
          const updated = await persistMedical();
          if (updated.conditions) set({ conditions: updated.conditions });
        } catch (e) {
          set({ conditions: prev });
          throw e;
        }
      },
      removeCondition: async (id) => {
        const prev = get().conditions;
        set((state) => ({ conditions: state.conditions.filter((c) => c.id !== id) }));
        try {
          const updated = await persistMedical();
          if (updated.conditions) set({ conditions: updated.conditions });
        } catch (e) {
          set({ conditions: prev });
          throw e;
        }
      },

      addMedication: async (name, dose) => {
        const prev = get().medications;
        set((state) => ({
          medications: [...state.medications, { id: makeId(), name, dose }],
        }));
        try {
          const updated = await persistMedical();
          if (updated.medications) set({ medications: updated.medications });
        } catch (e) {
          set({ medications: prev });
          throw e;
        }
      },
      updateMedication: async (id, name, dose) => {
        const prev = get().medications;
        set((state) => ({
          medications: state.medications.map((m) => (m.id === id ? { ...m, name, dose } : m)),
        }));
        try {
          const updated = await persistMedical();
          if (updated.medications) set({ medications: updated.medications });
        } catch (e) {
          set({ medications: prev });
          throw e;
        }
      },
      removeMedication: async (id) => {
        const prev = get().medications;
        set((state) => ({ medications: state.medications.filter((m) => m.id !== id) }));
        try {
          const updated = await persistMedical();
          if (updated.medications) set({ medications: updated.medications });
        } catch (e) {
          set({ medications: prev });
          throw e;
        }
      },

      setEmergencyContact: async (emergencyContact) => {
        const prev = get().emergencyContact;
        set({ emergencyContact });
        try {
          const { patchProfile } = await import('@/lib/api/patient');
          await patchProfile({ emergencyContact });
        } catch (e) {
          set({ emergencyContact: prev });
          throw e;
        }
      },

      addVitalsEntry: async (entry) => {
        const prev = get().vitals;
        set((state) => ({
          vitals: [{ id: makeId(), date: todayIso(), ...entry }, ...state.vitals],
        }));
        try {
          const { addVitals } = await import('@/lib/api/patient');
          const updated = await addVitals(entry);
          if (updated.vitals) set({ vitals: updated.vitals });
        } catch (e) {
          set({ vitals: prev });
          throw e;
        }
      },
      removeVitalsEntry: (id) =>
        set((state) => ({ vitals: state.vitals.filter((v) => v.id !== id) })),

      hydrateFromApi: (data) =>
        set((state) => ({
          bloodGroup: data.bloodGroup !== undefined ? data.bloodGroup : state.bloodGroup,
          allergies: data.allergies ?? state.allergies,
          conditions: data.conditions ?? state.conditions,
          medications: data.medications ?? state.medications,
          vitals: data.vitals ?? state.vitals,
          emergencyContact: data.emergencyContact ?? state.emergencyContact,
        })),
    }),
    {
      name: 'pulse-medical-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
