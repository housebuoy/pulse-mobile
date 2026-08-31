export interface DepartmentOption {
  label: string;
  value: string;
}

export const DEPARTMENTS: DepartmentOption[] = [
  { label: 'General OPD', value: 'general' },
  { label: 'Cardiology', value: 'cardiology' },
  { label: 'Dental Clinic', value: 'dental' },
  { label: 'Eye Clinic', value: 'eye' },
  { label: 'Pediatrics', value: 'pediatrics' },
];
