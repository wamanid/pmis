import axiosInstance from "../axiosInstance";

const LETTERS_BASE = "/rehabilitation/eletters/";
const LETTER_TYPES = "/rehabilitation/letter-types/";
const RELATIONSHIPS = "/system-administration/relationships/";

export interface ELetterItem {
  id: string;
  prisoner_name?: string;
  letter_type_name?: string;
  prisoner_number?: string;
  censored_by_name?: string;
  welfare_officer_name?: string;
  delivered_by_name?: string;
  handled_by_name?: string;
  relation_name?: string;
  created_datetime?: string;
  subject?: string;
  letter_tracking_number?: string;
  letter_date?: string;
  letter_content?: string;
  recipient_email?: string;
  sender_email?: string;
  sender_name?: string;
  recipient_name?: string;
  comment?: string;
  prisoner?: string;
  letter_type?: string;
  relation_to_prisoner?: string;
  [k: string]: any;
}

/**
 * Fetch paginated letters
 */
export const fetchLetters = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(LETTERS_BASE, { params, signal });
  return res.data;
};

export const fetchLetterById = async (id: string, signal?: AbortSignal) => {
  const res = await axiosInstance.get(`${LETTERS_BASE}${id}/`, { signal });
  return res.data;
};

export const createLetter = async (payload: Record<string, any>) => {
  const res = await axiosInstance.post(LETTERS_BASE, payload);
  return res.data;
};

export const updateLetter = async (id: string, payload: Record<string, any>) => {
  const res = await axiosInstance.patch(`${LETTERS_BASE}${id}/`, payload);
  return res.data;
};

export const deleteLetter = async (id: string) => {
  const res = await axiosInstance.delete(`${LETTERS_BASE}${id}/`);
  return res.data;
};

/**
 * Lookup endpoints
 */
export const fetchLetterTypes = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(LETTER_TYPES, { params, signal });
  return res.data?.results ?? res.data ?? [];
};

export const fetchRelationships = async (params?: Record<string, any>, signal?: AbortSignal) => {
  const res = await axiosInstance.get(RELATIONSHIPS, { params, signal });
  return res.data?.results ?? res.data ?? [];
};