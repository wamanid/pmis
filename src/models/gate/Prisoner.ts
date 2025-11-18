export interface Prisoner {
  id: string;
  prisoner_name: string;
  working_party_name: string;
  destination: string;
  time_out: string;
  time_in: string | null;
  reason: string;
  prisoner: string;
  gate_pass: string;
  working_party: string | null;
  prisoner_number: string;
}