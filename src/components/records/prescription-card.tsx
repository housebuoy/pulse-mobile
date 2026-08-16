import React from 'react';
import { format, parseISO } from 'date-fns';
import { Prescription } from '@/stores/records-store';
import RecordListCard from './record-list-card';

const ICON = { family: 'Ionicons' as const, name: 'medkit-outline', bgColor: '#DBEAFE', color: '#2563EB' };

interface PrescriptionCardProps {
  prescription: Prescription;
  onPress: () => void;
}

export default function PrescriptionCard({ prescription, onPress }: PrescriptionCardProps) {
  return (
    <RecordListCard
      icon={ICON}
      title={prescription.medication}
      dateLabel={format(parseISO(prescription.date), 'd MMM yyyy')}
      hospital={prescription.hospital}
      doctorLabel={prescription.prescribingDoctor}
      previewText={prescription.dose}
      actionLabel="View Prescription"
      onPress={onPress}
    />
  );
}
