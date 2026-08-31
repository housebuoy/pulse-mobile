import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  distanceLabel: string;
  categories: string[]; // departments this hospital offers, matches the category pills
  waitStatus: 'Low Wait' | 'Moderate Wait' | 'High Wait';
  nextSlot: string;
  rating: string;
  imageUrl: string;
  status: string;
}

const MOCK_HOSPITALS: Hospital[] = [
  {
    id: 'knust-university-hospital',
    name: 'KNUST University Hospital',
    location: 'University Road, Kumasi • Open 24/7',
    distanceKm: 2.5,
    distanceLabel: '2.5 km',
    categories: ['General', 'Cardiology'],
    waitStatus: 'Low Wait',
    nextSlot: '10:30 AM',
    rating: '4.8 (120+)',
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=2000&auto=format&fit=crop',
    status: 'Open 24/7',
  },
  {
    id: 'komfo-anokye-teaching',
    name: 'Komfo Anokye Teaching',
    location: 'Bantama, Kumasi • Referral Center',
    distanceKm: 4.2,
    distanceLabel: '4.2 km',
    categories: ['General', 'Dentist', 'Eye'],
    waitStatus: 'Moderate Wait',
    nextSlot: '2:15 PM',
    rating: '4.5 (850+)',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop',
    status: 'Referral Center',
  },
  {
    id: 'hopexchange-medical',
    name: 'HopeXchange Medical',
    location: 'Santasi, Kumasi • Specialist Care',
    distanceKm: 1.8,
    distanceLabel: '1.8 km',
    categories: ['Eye', 'Cardiology'],
    waitStatus: 'High Wait',
    nextSlot: 'Tomorrow',
    rating: '4.9 (56)',
    imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop',
    status: 'Specialist Care',
  },
  {
    id: 'suntreso-government',
    name: 'Suntreso Government Hospital',
    location: 'Suntreso, Kumasi • Public Facility',
    distanceKm: 3.1,
    distanceLabel: '3.1 km',
    categories: ['General', 'Dentist'],
    waitStatus: 'Moderate Wait',
    nextSlot: '11:45 AM',
    rating: '4.3 (210+)',
    imageUrl: 'https://images.unsplash.com/photo-1516549655669-df64a4b6f3a5?q=80&w=2000&auto=format&fit=crop',
    status: 'Public Facility',
  },
];

interface HospitalsState {
  hospitals: Hospital[];
  savedHospitalIds: string[];
  toggleSaved: (id: string) => void;
}

export const useHospitalsStore = create<HospitalsState>()(
  persist(
    (set) => ({
      hospitals: MOCK_HOSPITALS,
      savedHospitalIds: [],
      toggleSaved: (id) =>
        set((state) => ({
          savedHospitalIds: state.savedHospitalIds.includes(id)
            ? state.savedHospitalIds.filter((savedId) => savedId !== id)
            : [...state.savedHospitalIds, id],
        })),
    }),
    {
      name: 'pulse-hospitals-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
