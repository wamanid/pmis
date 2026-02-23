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


export const getWorkingpartyPrisoners = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('earning-scheme/api/working-party-prisoners/');
  return response.data;
};




export const getEarningRateForPrisoner = async (id:string): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>(`earning-scheme/api/prisoner-earning-rates/?prisoner=${id}`);
  return response.data;
};
