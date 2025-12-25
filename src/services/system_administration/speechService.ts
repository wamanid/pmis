import axiosInstance from '../axiosInstance';
import type {
  Speech,
  SpeechListResponse,
  SpeechQueryParams,
  CreateSpeechParams,
  UpdateSpeechParams,
} from '../../models/system_administration/speech';

const BASE_URL = '/system-administration/speeches/';

/**
 * Fetch all speeches with optional filtering and pagination
 */
export const fetchSpeeches = async (
  params?: SpeechQueryParams
): Promise<SpeechListResponse> => {
  const response = await axiosInstance.get<SpeechListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single speech by ID
 */
export const fetchSpeechById = async (id: string): Promise<Speech> => {
  const response = await axiosInstance.get<Speech>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new speech
 */
export const createSpeech = async (
  data: CreateSpeechParams
): Promise<Speech> => {
  const response = await axiosInstance.post<Speech>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing speech
 */
export const updateSpeech = async (
  id: string,
  data: UpdateSpeechParams
): Promise<Speech> => {
  const response = await axiosInstance.patch<Speech>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a speech
 */
export const deleteSpeech = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};
