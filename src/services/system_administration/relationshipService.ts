import axiosInstance from '../axiosInstance';
import type {
  Relationship,
  RelationshipListResponse,
  RelationshipQueryParams,
} from '../../models/system_administration';

export const fetchRelationships = async (
  params?: RelationshipQueryParams
): Promise<RelationshipListResponse> => {
  const response = await axiosInstance.get<RelationshipListResponse>(
    '/system-administration/relationships/',
    { params }
  );
  return response.data;
};

export const fetchRelationshipById = async (id: string): Promise<Relationship> => {
  const response = await axiosInstance.get<Relationship>(
    `/system-administration/relationships/${id}/`
  );
  return response.data;
};

export const createRelationship = async (
  data: Partial<Relationship>
): Promise<Relationship> => {
  const response = await axiosInstance.post<Relationship>(
    '/system-administration/relationships/',
    data
  );
  return response.data;
};

export const updateRelationship = async (
  id: string,
  data: Partial<Relationship>
): Promise<Relationship> => {
  const response = await axiosInstance.put<Relationship>(
    `/system-administration/relationships/${id}/`,
    data
  );
  return response.data;
};

export const patchRelationship = async (
  id: string,
  data: Partial<Relationship>
): Promise<Relationship> => {
  const response = await axiosInstance.patch<Relationship>(
    `/system-administration/relationships/${id}/`,
    data
  );
  return response.data;
};

export const deleteRelationship = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/system-administration/relationships/${id}/`);
};
