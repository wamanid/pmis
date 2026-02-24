import axiosInstance from './axiosInstance';
import {WorkingParty, WorkingPartyResponse } from '../models/gate/Index';

export const getEarningRateTypes = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('earning-scheme/api/earning-rates/');
  return response.data;
};

export const getEarningSchemes = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('earning-scheme/api/attendance/');
  return response.data;
};



export const saveEarningSchemes = async (data:object): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.post<WorkingPartyResponse[]>('earning-scheme/api/attendance/', data);
  return response.data;
};




export const getWorkingpartyPrisoners = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('earning-scheme/api/working-party-prisoners/');
  return response.data;
};



export const deleteEarningScheme = async (id:string): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.delete<WorkingPartyResponse[]>('earning-scheme/api/attendance/'+id);
  return response.data;
};


export const getEarningRateForPrisoner = async (id:string): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>(`earning-scheme/api/prisoner-earning-rates/?prisoner=${id}`);
  return response.data;
};
