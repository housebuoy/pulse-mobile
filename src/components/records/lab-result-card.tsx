import React from 'react';
import { format, parseISO } from 'date-fns';
import { LabResult } from '@/stores/records-store';
import RecordListCard from './record-list-card';

const ICON = { family: 'Ionicons' as const, name: 'flask-outline', bgColor: '#DBEAFE', color: '#2563EB' };

interface LabResultCardProps {
  labResult: LabResult;
  onPress: () => void;
}

export default function LabResultCard({ labResult, onPress }: LabResultCardProps) {
  const previewText = labResult.values
    .map((v) => `${v.name} ${v.value}${v.unit ? ` ${v.unit}` : ''}`)
    .join(' · ');

  return (
    <RecordListCard
      icon={ICON}
      title={labResult.testName}
      dateLabel={format(parseISO(labResult.date), 'd MMM yyyy')}
      hospital={labResult.hospital}
      doctorLabel={labResult.orderingDoctor}
      previewText={previewText}
      actionLabel="View Full Panel"
      onPress={onPress}
    />
  );
}
