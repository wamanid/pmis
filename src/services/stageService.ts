import axiosInstance from './axiosInstance';
import { ApiMenuItem, MenuResponse } from '../models/common/menu';
import {WorkingPartyResponse } from '../models/gate/Index';
import { StageAssignmentPost, StageDemotionPost } from '../models/StageClassification';
import { StageAssignment } from '../components/StageClassification/StageAssignForm';
export type { ApiMenuItem, MenuResponse };


export const getStages = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('system-administration/stages/');
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


export const updateStageData = async (gatePassData: StageAssignmentPost): Promise<StageAssignmentPost> => {
  const response = await axiosInstance.patch<StageAssignmentPost>(`stage-management/prisoner-stages/${gatePassData.id}/`, gatePassData);
  return response.data;
};


export const deleteStageData = async (id: String): Promise<StageAssignmentPost> => {
  const response = await axiosInstance.delete<StageAssignmentPost>(`stage-management/prisoner-stages/${id}/`);
  return response.data;
};




//demotion auto demotion api call

export const demotePrioners = async (gatePassData: StageDemotionPost): Promise<string> => {
  const response = await axiosInstance.post<string>('stage-management/prisoner-stages/demote/', gatePassData);
return response.data;

};

//promote prisoners api call
export const promotePrioners = async (gatePassData: StageDemotionPost): Promise<string> => {
  const response = await axiosInstance.post<string>('stage-management/prisoner-stages/promote/', gatePassData);
return response.data;

};

// manula promotion api call
export const manualPromotion = async (gatePassData: StageDemotionPost): Promise<string> => {
  const response = await axiosInstance.post<string>('stage-management/prisoner-stages/bulk/', gatePassData);
return response.data;

};


