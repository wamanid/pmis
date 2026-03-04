import axiosInstance from '../axiosInstance';
import type {
  ArmedForceStatus,
  ArmedForceStatusListResponse,
  ArmedForceStatusQueryParams,
} from '../../models/system_administration/armedForceStatus';

/**
 * Armed Force Status Service
 * Handles API calls for armed force status operations
 */

/**
 * Fetch list of armed force statuses with optional filters
 * @param params - Optional query parameters
 * @returns Paginated list of armed force statuses
 */
export const fetchArmedForceStatuses = async (
  params?: ArmedForceStatusQueryParams
): Promise<ArmedForceStatusListResponse> => {
  try {
    const response = await axiosInstance.get<ArmedForceStatusListResponse>(
      'system-administration/armed-force-statuses/',
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching armed force statuses:', error);
    throw error;
  }
};

/**
 * Fetch a single armed force status by ID
 * @param id - Armed force status ID
 * @returns Armed force status details
 */
export const getArmedForceStatusById = async (
  id: string
): Promise<ArmedForceStatus> => {
  try {
    const response = await axiosInstance.get<ArmedForceStatus>(
      `system-administration/armed-force-statuses/${id}/`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching armed force status ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new armed force status
 * @param data - Armed force status data
 * @returns Created armed force status
 */
export const createArmedForceStatus = async (
  data: Partial<ArmedForceStatus>
): Promise<ArmedForceStatus> => {
  try {
    const response = await axiosInstance.post<ArmedForceStatus>(
      'system-administration/armed-force-statuses/',
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error creating armed force status:', error);
    throw error;
  }
};

/**
 * Update an existing armed force status
 * @param id - Armed force status ID
 * @param data - Updated armed force status data
 * @returns Updated armed force status
 */
export const updateArmedForceStatus = async (
  id: string,
  data: Partial<ArmedForceStatus>
): Promise<ArmedForceStatus> => {
  try {
    const response = await axiosInstance.patch<ArmedForceStatus>(
      `system-administration/armed-force-statuses/${id}/`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating armed force status ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an armed force status
 * @param id - Armed force status ID
 */
export const deleteArmedForceStatus = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(
      `system-administration/armed-force-statuses/${id}/`
    );
  } catch (error) {
    console.error(`Error deleting armed force status ${id}:`, error);
    throw error;
  }
};
