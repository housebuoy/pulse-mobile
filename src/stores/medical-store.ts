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

  setBloodGroup: (bloodGroup: string) => void;

  addAllergy: (label: string, type: AllergyType) => void;
  removeAllergy: (id: string) => void;

  addCondition: (label: string) => void;
  removeCondition: (id: string) => void;

  addMedication: (name: string, dose: string) => void;
  updateMedication: (id: string, name: string, dose: string) => void;
  removeMedication: (id: string) => void;

  setEmergencyContact: (contact: EmergencyContact) => void;

  addVitalsEntry: (entry: Omit<VitalsEntry, 'id' | 'date'>) => void;
  removeVitalsEntry: (id: string) => void;
}

const makeId = () => `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
const todayIso = () => new Date().toISOString().split('T')[0];

// Seeded with a light demo profile so the screen isn't empty on first open,
// matching how the queue/profile stores ship with a demo record.
export const useMedicalStore = create<MedicalState>()(
  persist(
    (set) => ({
      bloodGroup: 'O+',
      allergies: [{ id: 'seed-allergy-1', label: 'Penicillin', type: 'drug' }],
      conditions: [{ id: 'seed-condition-1', label: 'Asthma' }],
      medications: [{ id: 'seed-medication-1', name: 'Ventolin Inhaler', dose: '100mcg, as needed' }],
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

      setBloodGroup: (bloodGroup) => set({ bloodGroup }),

      addAllergy: (label, type) =>
        set((state) => ({
          allergies: [...state.allergies, { id: makeId(), label, type }],
        })),
      removeAllergy: (id) =>
        set((state) => ({ allergies: state.allergies.filter((a) => a.id !== id) })),

      addCondition: (label) =>
        set((state) => ({
          conditions: [...state.conditions, { id: makeId(), label }],
        })),
      removeCondition: (id) =>
        set((state) => ({ conditions: state.conditions.filter((c) => c.id !== id) })),

      addMedication: (name, dose) =>
        set((state) => ({
          medications: [...state.medications, { id: makeId(), name, dose }],
        })),
      updateMedication: (id, name, dose) =>
        set((state) => ({
          medications: state.medications.map((m) => (m.id === id ? { ...m, name, dose } : m)),
        })),
      removeMedication: (id) =>
        set((state) => ({ medications: state.medications.filter((m) => m.id !== id) })),

      setEmergencyContact: (emergencyContact) => set({ emergencyContact }),

      addVitalsEntry: (entry) =>
        set((state) => ({
          vitals: [{ id: makeId(), date: todayIso(), ...entry }, ...state.vitals],
        })),
      removeVitalsEntry: (id) =>
        set((state) => ({ vitals: state.vitals.filter((v) => v.id !== id) })),
    }),
    {
      name: 'pulse-medical-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
