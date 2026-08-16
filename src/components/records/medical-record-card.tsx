import React from 'react';
import { DEPARTMENT_CONFIG } from '@/constants/medical-category';
import RecordListCard from './record-list-card';

interface MedicalRecordCardProps {
  department: string;
  hospital: string;
  date: string;
  doctor: string;
  summary: string;
  onPress: () => void;
}

export default function MedicalRecordCard({
  department,
  hospital,
  date,
  doctor,
  summary,
  onPress,
}: MedicalRecordCardProps) {
  const config = DEPARTMENT_CONFIG[department] || DEPARTMENT_CONFIG['Default'];

  return (
    <RecordListCard
      icon={config}
      title={department}
      dateLabel={date}
      hospital={hospital}
      doctorLabel={doctor}
      previewText={summary}
      actionLabel="View Full Summary"
      onPress={onPress}
    />
  );
}
