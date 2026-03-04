/**
 * Prisoner Number Models
 * Represents prisoner number reservation and generation responses
 */

export interface PrisonerPersonalNumberDetails {
  id: string;
  prisoner_personal_number: string;
  created_datetime: string;
}

export interface PrisonerNumberReservationResponse {
  id: string; // Reservation ID
  prisoner_personal_number_details: PrisonerPersonalNumberDetails;
  prisoner_number: string; // The actual prisoner number string (e.g., "GLPC0000000002/26")
  reservation_id: string;
  created_datetime: string;
  prisoner_id: string; // The prisoner record ID
}
