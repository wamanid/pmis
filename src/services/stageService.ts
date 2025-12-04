import axiosInstance from './axiosInstance';
import { ApiMenuItem, MenuResponse } from '../models/common/menu';
import {WorkingPartyResponse } from '../models/gate/Index';
import { StageAssignmentPost } from '../models/StageClassification';
export type { ApiMenuItem, MenuResponse };


export const getStages = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('rehabilitation/programme-stages/');
  return response.data;
};
//get the stage list data here
export const getStageList = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('stage-management/prisoner-stages/');
  return response.data;
};

//save stage data


export const submitStageData = async (gatePassData: StageAssignmentPost): Promise<StageAssignmentPost> => {
  const response = await axiosInstance.post<StageAssignmentPost>('stage-management/prisoner-stages/', gatePassData);
  return response.data;
};
