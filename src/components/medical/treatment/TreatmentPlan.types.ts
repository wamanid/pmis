// Treatment Plan Type Definitions

export interface TreatmentMedication {
  id: string;
  medication_name: string;
  medication_type: 'Tablet' | 'Syrup' | 'Injection' | 'Ointment' | 'IV' | 'Capsule' | 'Drop' | 'Inhaler';
  is_quantifiable: boolean;
  quantity?: number;
  quantity_unit?: string;
  dosage_quantity: string;
  dosage_frequency: string;
  dosage_duration?: number;
  dosage_duration_unit?: string;
  dosage_timing?: string;
  additional_instructions?: string;
}

export interface TreatmentPlan {
  id: string;
  case_book_id: string;
  case_book_reference?: string;
  prisoner_number?: string;
  prisoner_name?: string;
  diagnosis_id?: string;
  diagnosis_name?: string;
  prescribed_by: string;
  prescribed_by_name?: string;
  date_prescribed: string;
  treatment_status: 'Active' | 'Completed' | 'Discontinued';
  general_notes?: string;
  medications: TreatmentMedication[];
  created_at?: string;
  updated_at?: string;
}

export const MEDICATION_TYPES = [
  'Tablet',
  'Syrup',
  'Injection',
  'Ointment',
  'IV',
  'Capsule',
  'Drop',
  'Inhaler',
] as const;

export const QUANTITY_UNITS = [
  'tablets',
  'ml',
  'mg',
  'vials',
  'capsules',
  'drops',
  'puffs',
  'sachets',
  'units',
] as const;

export const DOSAGE_FREQUENCIES = [
  '1x daily',
  '2x daily',
  '3x daily',
  '4x daily',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'Once weekly',
  'PRN (As needed)',
  'Stat (Immediately)',
  'Custom',
] as const;

export const DOSAGE_TIMING = [
  'Before food',
  'After food',
  'With food',
  'On empty stomach',
  'At bedtime',
  'In the morning',
  'In the evening',
  'As needed',
  'Not applicable',
] as const;

export const DURATION_UNITS = [
  'days',
  'weeks',
  'months',
  'until review',
  'ongoing',
] as const;
