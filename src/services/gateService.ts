import axiosInstance from './axiosInstance';
import { ApiMenuItem, MenuResponse } from '../models/common/menu';
import { GatePass, Visitor, VisitorPass, WorkingParty, WorkingPartyResponse } from '../models/gate/Index';

export type { ApiMenuItem, MenuResponse };

/**
 * Fetch menu items from backend
 */
export const getworkingparty = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('/earning-scheme/api/working-parties/');
  return response.data;
};

//get escorts
export const getescots = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('/auth/staff-profiles/');
  return response.data;
};

//get pass types
//get escorts
export const getpasstypes = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('/system-administration/gate-pass-types/');
  return response.data;
};


//get prisoners
export const getprisoners = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('/admission/prisoners/');
  return response.data;
};


//send gate pass data to backend
export const submitGatePass = async (gatePassData: GatePass): Promise<GatePass> => {
  const response = await axiosInstance.post<GatePass>('/gate-management/gate-passes/', gatePassData);
  return response.data;
};


//get the gate passes here
//get prisoners
export const getgatepasses = async (): Promise<GatePass[]> => {
  const response = await axiosInstance.get<GatePass[]>('/gate-management/gate-passes/');
  return response.data;
};



//get movements
export const getprisonerMovements = async (): Promise<GatePass[]> => {
  const response = await axiosInstance.get<GatePass[]>('gate-management/gate-pass-prisoners/');
  return response.data;
};

//delete gatepass
export const deletegatepasses = async (id:String): Promise<GatePass[]> => {
  const response = await axiosInstance.delete<GatePass[]>(`/gate-management/gate-passes/${id}/`);
  return response.data;
};



//get visitors here

export const getvisitors = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('gate-management/visitors/');
  return response.data;
};

//create visitto pass
export const submitVisitorPass = async (visitorPassData: VisitorPass): Promise<VisitorPass> => {
  const response = await axiosInstance.post<VisitorPass>('/gate-management/visitor-passes/', visitorPassData);
  return response.data;
};

//get visitors here

export const getvisitorspass = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('gate-management/visitor-passes/');
  return response.data;
};
