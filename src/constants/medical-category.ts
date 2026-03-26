export type IconFamily = 'Ionicons' | 'FontAwesome5' | 'FontAwesome6' | 'MaterialCommunityIcons' | 'MaterialIcons';

// 2. Export the config dictionary
export const DEPARTMENT_CONFIG: Record<
  string,
  { family: IconFamily; name: string; bgColor: string; color: string }
> = {
  'General OPD': {
    family: 'Ionicons',
    name: 'medical',
    bgColor: '#EFF6FF',
    color: '#2563EB',
  },
  'Dental Clinic': {
    family: 'FontAwesome5',
    name: 'tooth',
    bgColor: '#F0FDFA',
    color: '#0D9488',
  },
  Cardiology: {
    family: 'FontAwesome6',
    name: 'heart-pulse',
    bgColor: '#FFF1F2',
    color: '#E11D48',
  },
  'Eye Clinic': {
    family: 'Ionicons',
    name: 'eye',
    bgColor: '#F0FDF4',
    color: '#16A34A',
  },
  Orthopedics: {
    family: 'MaterialCommunityIcons',
    name: 'bone',
    bgColor: '#F5F3FF',
    color: '#7C3AED',
  },
  Dermatology: {
    family: 'MaterialIcons',
    name: 'face-retouching-natural',
    bgColor: '#FFF7ED',
    color: '#EA580C',
  },
  Default: {
    family: 'Ionicons',
    name: 'folder-open',
    bgColor: '#F3F4F6',
    color: '#6B7280',
  },
};
