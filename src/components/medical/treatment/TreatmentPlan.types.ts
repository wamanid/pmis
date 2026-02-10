// Treatment Plan Type Definitions

export interface TreatmentMedication {
  id: string;
  medication_name: string;
  medication_form: 'Tablet' | 'Syrup' | 'Injection' | 'Ointment' | 'IV' | 'Capsule' | 'Drop' | 'Inhaler' | 'Cream';
  is_quantifiable: boolean;
  quantity_dispensed?: number;
  dispensing_unit?: 'Individual' | 'Strip' | 'Packet' | 'Bottle' | 'Vial' | 'Ampule' | 'Tube';
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

export const MEDICATION_FORMS = [
  'Tablet',
  'Syrup',
  'Injection',
  'Ointment',
  'IV',
  'Capsule',
  'Drop',
  'Inhaler',
  'Cream',
] as const;

// Context-aware dispensing units based on medication form
export const DISPENSING_UNITS: Record<string, Array<'Individual' | 'Strip' | 'Packet' | 'Bottle' | 'Vial' | 'Ampule' | 'Tube'>> = {
  Tablet: ['Individual', 'Strip', 'Packet'],
  Capsule: ['Individual', 'Strip', 'Packet'],
  Syrup: ['Bottle'],
  Injection: ['Vial', 'Ampule'],
  IV: ['Bottle'],
  Ointment: ['Tube'],
  Cream: ['Tube'],
  Drop: ['Bottle'],
  Inhaler: ['Individual'],
};

// Display labels for dispensing units
export const DISPENSING_UNIT_LABELS: Record<string, string> = {
  Individual: 'Individual units',
  Strip: 'Strip (typically 10 units)',
  Packet: 'Packet (multiple strips)',
  Bottle: 'Bottle',
  Vial: 'Vial',
  Ampule: 'Ampule',
  Tube: 'Tube',
};

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
