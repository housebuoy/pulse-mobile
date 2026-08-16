import React from 'react';
import { format, parseISO } from 'date-fns';
import { Prescription } from '@/stores/records-store';
import RecordDetailSheet, { DetailFieldRow } from './record-detail-sheet';

interface PrescriptionDetailSheetProps {
  prescription: Prescription | null;
  onClose: () => void;
}

// Read-only, as recorded — there is nothing here to edit, no dosage or
// refill suggestion, and no interaction check against other medications.
export default function PrescriptionDetailSheet({ prescription, onClose }: PrescriptionDetailSheetProps) {
  return (
    <RecordDetailSheet
      visible={!!prescription}
      onClose={onClose}
      title={prescription?.medication ?? ''}
      footerNote="This is a record of what was prescribed. Pulse does not suggest dosages or refills — for changes, contact the prescribing doctor.">
      {prescription && (
        <>
          <DetailFieldRow label="Medication" value={prescription.medication} />
          <DetailFieldRow label="Dose (as prescribed)" value={prescription.dose} />
          <DetailFieldRow label="Prescribing Doctor" value={prescription.prescribingDoctor} />
          <DetailFieldRow label="Hospital" value={prescription.hospital} />
          <DetailFieldRow
            label="Date"
            value={format(parseISO(prescription.date), 'MMMM d, yyyy')}
            isLast
          />
        </>
      )}
    </RecordDetailSheet>
  );
}
