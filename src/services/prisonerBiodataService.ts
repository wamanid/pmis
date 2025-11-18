import axiosInstance from "../axiosInstance";
import {
  PrisonerBiodata,
  PrisonerBiodataListResponse,
  PrisonerBiodataFilters,
} from "../../models/admission";

/**
 * Prisoner Biodata Service
 * Handles API calls for prisoner biodata operations
 */

export const getPrisonerBiodata = async (
  filters?: PrisonerBiodataFilters,
): Promise<PrisonerBiodataListResponse> => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.habitual_criminal !== undefined)
      params.append('habitual_criminal', String(filters.habitual_criminal));
    if (filters.is_active !== undefined)
      params.append('is_active', String(filters.is_active));
    if (filters.marital_status)
      params.append('marital_status', filters.marital_status);
    if (filters.nationality)
      params.append('nationality', filters.nationality);
    if (filters.ordering)
      params.append('ordering', filters.ordering);
    if (filters.page)
      params.append('page', String(filters.page));
    if (filters.prisoner)
      params.append('prisoner', filters.prisoner);
    if (filters.prisoner_class)
      params.append('prisoner_class', filters.prisoner_class);
    if (filters.religion)
      params.append('religion', filters.religion);
    if (filters.search)
      params.append('search', filters.search);
    if (filters.sex)
      params.append('sex', filters.sex);
    if (filters.tribe)
      params.append('tribe', filters.tribe);
  }

  const queryString = params.toString();
  const url = `admission/prisoner-biodata/${queryString ? `?${queryString}` : ""}`;

  const response = await axiosInstance.get<PrisonerBiodataListResponse>(url);
  return response.data;
};

/**
 * Fetch biodata for a specific prisoner by prisoner ID using the detail endpoint.
 */
export const getPrisonerBiodataByPrisonerId = async (
  prisonerId: string,
): Promise<PrisonerBiodata> => {
  const url = `admission/prisoner-biodata/${prisonerId}/`;
  const response = await axiosInstance.get<PrisonerBiodata>(url);
  return response.data;
};

/**
 * Create new prisoner biodata
 */
export const createPrisonerBiodata = async (
  data: Partial<PrisonerBiodata>,
): Promise<PrisonerBiodata> => {
  const url = 'admission/prisoner-biodata/';
  const response = await axiosInstance.post<PrisonerBiodata>(url, data);
  return response.data;
};
