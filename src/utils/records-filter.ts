import { differenceInCalendarDays, parseISO } from 'date-fns';
import { matchesQuery, uniqueSorted } from './search';

export { matchesQuery, uniqueSorted };

export type DatePreset = 'all' | '30d' | '6m' | '1y';

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: '30d', label: 'Last 30 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last year' },
];

const PRESET_DAYS: Record<DatePreset, number | null> = {
  all: null,
  '30d': 30,
  '6m': 182,
  '1y': 365,
};

export function isWithinDatePreset(dateIso: string, preset: DatePreset): boolean {
  const days = PRESET_DAYS[preset];
  if (days === null) return true;
  return differenceInCalendarDays(new Date(), parseISO(dateIso)) <= days;
}

export interface RecordsFilterState {
  datePreset: DatePreset;
  hospital: string | null;
  doctor: string | null;
  type: string | null;
}

export const DEFAULT_RECORDS_FILTER: RecordsFilterState = {
  datePreset: 'all',
  hospital: null,
  doctor: null,
  type: null,
};

export function isFilterActive(filter: RecordsFilterState): boolean {
  return filter.datePreset !== 'all' || !!filter.hospital || !!filter.doctor || !!filter.type;
}
