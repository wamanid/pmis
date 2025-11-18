import axiosInstance from './axiosInstance';
import { ApiMenuItem, MenuResponse } from '../models/common/menu';
import {WorkingPartyResponse } from '../models/gate/Index';
export type { ApiMenuItem, MenuResponse };


export const getStages = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('rehabilitation/programme-stages/');
  return response.data;
};
