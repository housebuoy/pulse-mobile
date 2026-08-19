import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// RECORD-KEEPING ONLY. Every record here is captured and shown exactly as
// received from the hospital/lab/clinician — nothing in this store or the
// screens that read it flags a value as high/low, warns about interactions,
// or suggests a dose/refill. Prescriptions in particular are read-only: the
// patient can view them, never author or edit one.
export interface Visit {
  id: string;
  department: string;
  hospital: string;
  date: string; // ISO date
  doctor: string;
  summary: string;
}

export interface LabValue {
  name: string;
  value: string;
  unit?: string;
  referenceRange?: string; // shown as plain text if present in the record — never judged against
}

export interface LabResult {
  id: string;
  testName: string;
  hospital: string;
  orderingDoctor: string;
  date: string; // ISO date
  values: LabValue[];
}

export interface Prescription {
  id: string;
  medication: string;
  dose: string; // as prescribed, verbatim
  prescribingDoctor: string;
  hospital: string;
  date: string; // ISO date
}

interface RecordsState {
  visits: Visit[];
  labResults: LabResult[];
  prescriptions: Prescription[];
  hydrateFromApi: (data: {
    visits?: Visit[];
    labResults?: LabResult[];
    prescriptions?: Prescription[];
  }) => void;
}

export const useRecordsStore = create<RecordsState>()(
  persist(
    (set) => ({
      visits: [
        {
          id: 'visit-1',
          department: 'General OPD',
          hospital: 'KNUST University Hospital',
          date: '2025-10-12',
          doctor: 'Dr. E. Arhin',
          summary:
            'Treated for acute Malaria. Prescribed Artemether-Lumefantrine. Patient advised to rest and hydrate.',
        },
        {
          id: 'visit-2',
          department: 'Dental Clinic',
          hospital: 'Komfo Anokye Teaching Hospital',
          date: '2025-08-04',
          doctor: 'Dr. S. Mensah',
          summary: 'Routine cleaning and cavity filling (Tooth 14). Patient reported mild sensitivity.',
        },
        {
          id: 'visit-3',
          department: 'Cardiology',
          hospital: 'Korle-Bu Teaching Hospital',
          date: '2024-02-15',
          doctor: 'Dr. K. Ofori',
          summary: 'Annual cardiac checkup. BP 120/80. ECG normal. No murmurs detected.',
        },
        {
          id: 'visit-4',
          department: 'Eye Clinic',
          hospital: 'KNUST University Hospital',
          date: '2023-11-02',
          doctor: 'Dr. A. Boateng',
          summary: 'Routine vision screening. Prescribed reading glasses, +1.00 both eyes.',
        },
      ],

      labResults: [
        {
          id: 'lab-1',
          testName: 'Full Blood Count (FBC)',
          hospital: 'KNUST University Hospital',
          orderingDoctor: 'Dr. E. Arhin',
          date: '2025-10-12',
          values: [
            { name: 'Hemoglobin', value: '13.5', unit: 'g/dL', referenceRange: '12.0 - 16.0 g/dL' },
            { name: 'White Cell Count', value: '6.2', unit: '×10⁹/L', referenceRange: '4.0 - 11.0 ×10⁹/L' },
            { name: 'Platelets', value: '250', unit: '×10⁹/L', referenceRange: '150 - 450 ×10⁹/L' },
          ],
        },
        {
          id: 'lab-2',
          testName: 'Malaria Blood Film',
          hospital: 'KNUST University Hospital',
          orderingDoctor: 'Dr. E. Arhin',
          date: '2025-10-12',
          values: [{ name: 'Result', value: 'Positive (P. falciparum)' }],
        },
        {
          id: 'lab-3',
          testName: 'Fasting Blood Glucose',
          hospital: 'Komfo Anokye Teaching Hospital',
          orderingDoctor: 'Dr. S. Mensah',
          date: '2025-08-04',
          values: [{ name: 'Glucose', value: '5.4', unit: 'mmol/L', referenceRange: '3.9 - 5.6 mmol/L' }],
        },
        {
          id: 'lab-4',
          testName: 'Lipid Profile',
          hospital: 'Korle-Bu Teaching Hospital',
          orderingDoctor: 'Dr. K. Ofori',
          date: '2024-02-15',
          values: [
            { name: 'Total Cholesterol', value: '4.8', unit: 'mmol/L', referenceRange: '< 5.2 mmol/L' },
            { name: 'LDL', value: '2.6', unit: 'mmol/L', referenceRange: '< 3.4 mmol/L' },
            { name: 'HDL', value: '1.3', unit: 'mmol/L', referenceRange: '> 1.0 mmol/L' },
            { name: 'Triglycerides', value: '1.1', unit: 'mmol/L', referenceRange: '< 1.7 mmol/L' },
          ],
        },
      ],

      prescriptions: [
        {
          id: 'rx-1',
          medication: 'Artemether-Lumefantrine',
          dose: '80mg/480mg — twice daily for 3 days',
          prescribingDoctor: 'Dr. E. Arhin',
          hospital: 'KNUST University Hospital',
          date: '2025-10-12',
        },
        {
          id: 'rx-2',
          medication: 'Amoxicillin',
          dose: '500mg — three times daily for 7 days',
          prescribingDoctor: 'Dr. S. Mensah',
          hospital: 'Komfo Anokye Teaching Hospital',
          date: '2025-08-04',
        },
        {
          id: 'rx-3',
          medication: 'Atorvastatin',
          dose: '10mg — once daily at night',
          prescribingDoctor: 'Dr. K. Ofori',
          hospital: 'Korle-Bu Teaching Hospital',
          date: '2024-02-15',
        },
      ],

      hydrateFromApi: (data) =>
        set((state) => ({
          visits: data.visits ?? state.visits,
          labResults: data.labResults ?? state.labResults,
          prescriptions: data.prescriptions ?? state.prescriptions,
        })),
    }),
    {
      name: 'pulse-records-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
