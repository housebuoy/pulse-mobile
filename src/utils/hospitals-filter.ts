export type DistancePreset = 'any' | 'under2' | 'under5' | 'under10';

export const DISTANCE_PRESET_OPTIONS: { value: DistancePreset; label: string }[] = [
  { value: 'any', label: 'Any distance' },
  { value: 'under2', label: 'Under 2 km' },
  { value: 'under5', label: 'Under 5 km' },
  { value: 'under10', label: 'Under 10 km' },
];

const PRESET_MAX_KM: Record<DistancePreset, number | null> = {
  any: null,
  under2: 2,
  under5: 5,
  under10: 10,
};

export function isWithinDistancePreset(distanceKm: number, preset: DistancePreset): boolean {
  const max = PRESET_MAX_KM[preset];
  if (max === null) return true;
  return distanceKm <= max;
}

export interface HospitalsFilterState {
  category: string; // 'All' or one of the category pill values
  distancePreset: DistancePreset;
}

export const DEFAULT_HOSPITALS_FILTER: HospitalsFilterState = {
  category: 'All',
  distancePreset: 'any',
};

export function isHospitalsFilterActive(filter: HospitalsFilterState): boolean {
  return filter.category !== 'All' || filter.distancePreset !== 'any';
}
