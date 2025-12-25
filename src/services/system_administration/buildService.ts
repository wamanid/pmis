import axiosInstance from '../axiosInstance';
import type {
  Build,
  BuildListResponse,
  BuildQueryParams,
  CreateBuildParams,
  UpdateBuildParams,
} from '../../models/system_administration/build';

const BASE_URL = '/system-administration/body-builds/';

/**
 * Fetch all builds with optional filtering and pagination
 */
export const fetchBuilds = async (
  params?: BuildQueryParams
): Promise<BuildListResponse> => {
  const response = await axiosInstance.get<BuildListResponse>(BASE_URL, {
    params,
  });
  return response.data;
};

/**
 * Fetch a single build by ID
 */
export const fetchBuildById = async (id: string): Promise<Build> => {
  const response = await axiosInstance.get<Build>(`${BASE_URL}${id}/`);
  return response.data;
};

/**
 * Create a new build
 */
export const createBuild = async (
  data: CreateBuildParams
): Promise<Build> => {
  const response = await axiosInstance.post<Build>(BASE_URL, data);
  return response.data;
};

/**
 * Update an existing build
 */
export const updateBuild = async (
  id: string,
  data: UpdateBuildParams
): Promise<Build> => {
  const response = await axiosInstance.patch<Build>(
    `${BASE_URL}${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a build
 */
export const deleteBuild = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${BASE_URL}${id}/`);
};
