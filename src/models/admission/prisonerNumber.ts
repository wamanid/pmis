// Prisoner Number generation models

export interface PrisonerPersonalNumberDetails {
  id: string;
  prisoner_personal_number: string;
  created_datetime: string;
}

export interface PrisonerNumberReservationResponse {
  id: string;
  prisoner_personal_number_details: PrisonerPersonalNumberDetails;
  prisoner_number: string;
  reservation_id: string;
  created_datetime: string;
}
