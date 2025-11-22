import axiosInstance from '../axiosInstance';
import type {
  FaceType,
  FaceTypeListResponse,
  FaceTypeQueryParams,
  CreateFaceTypeParams,
  UpdateFaceTypeParams,
} from '../../models/system_administration/faceType';

const BASE_URL = '/system-administration/face-types/';

/**
 * Fetch all face types with optional filtering and pagination
 */
export const fetchFaceTypes = async (
  params?: FaceTypeQueryParams
): Promise<FaceTypeListResponse> => {
  const response = await axiosInstance.get<FaceTypeListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single face type by ID
 */
export const fetchFaceTypeById = async (id: string): Promise<FaceType> => {
  const response = await axiosInstance.get<FaceType>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new face type
 */
export const createFaceType = async (
  data: CreateFaceTypeParams
): Promise<FaceType> => {
  const response = await axiosInstance.post<FaceType>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing face type
 */
export const updateFaceType = async (
  id: string,
  data: UpdateFaceTypeParams
): Promise<FaceType> => {
  const response = await axiosInstance.patch<FaceType>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a face type
 */
export const deleteFaceType = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};
