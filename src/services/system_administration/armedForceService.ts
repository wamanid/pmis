import axiosInstance from '../axiosInstance';
import type {
  ArmedForce,
  ArmedForceListResponse,
  ArmedForceQueryParams,
} from '../../models/system_administration/armedForce';

/**
 * Armed Force Service
 * Handles API calls for armed force operations
 */

/**
 * Fetch list of armed forces with optional filters
 * @param params - Optional query parameters
 * @returns Paginated list of armed forces
 */
export const fetchArmedForces = async (
  params?: ArmedForceQueryParams
): Promise<ArmedForceListResponse> => {
  try {
    const response = await axiosInstance.get<ArmedForceListResponse>(
      'system-administration/armed-forces/',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching armed forces:', error);
    throw error;
  }
};

/**
 * Fetch a single armed force by ID
 * @param id - Armed force ID
 * @returns Armed force details
 */
export const getArmedForceById = async (id: string): Promise<ArmedForce> => {
  try {
    const response = await axiosInstance.get<ArmedForce>(
      `system-administration/armed-forces/${id}/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching armed force ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new armed force
 * @param data - Armed force data
 * @returns Created armed force
 */
export const createArmedForce = async (
  data: Partial<ArmedForce>
): Promise<ArmedForce> => {
  try {
    const response = await axiosInstance.post<ArmedForce>(
      'system-administration/armed-forces/',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error creating armed force:', error);
    throw error;
  }
};

/**
 * Update an existing armed force
 * @param id - Armed force ID
 * @param data - Updated armed force data
 * @returns Updated armed force
 */
export const updateArmedForce = async (
  id: string,
  data: Partial<ArmedForce>
): Promise<ArmedForce> => {
  try {
    const response = await axiosInstance.patch<ArmedForce>(
      `system-administration/armed-forces/${id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating armed force ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an armed force
 * @param id - Armed force ID
 */
export const deleteArmedForce = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`system-administration/armed-forces/${id}/`);
  } catch (error) {
    console.error(`Error deleting armed force ${id}:`, error);
    throw error;
  }
};
