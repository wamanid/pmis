import axiosInstance from './axiosInstance';
import { ApiMenuItem, MenuResponse } from '../models/common/menu';
import {WorkingParty, WorkingPartyResponse } from '../models/gate/Index';
import { OffenceRequest, StageAssignmentPost, StageDemotionPost } from '../models/StageClassification';
import { StageAssignment } from '../components/StageClassification/StageAssignForm';
import { CourtAttendanceRecord, CourtProceedingPost, CourtProceedingRecord, CourtSchedulePost, CourtVisitRecord } from '../models/court';
export type { ApiMenuItem, MenuResponse };


export const getCourtLevels = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('system-administration/court-levels/');
  return response.data;
};


export const getOffences = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('system-administration/offences/');
  return response.data;
};



export const getCourtDetails = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('system-administration/court-details/');
  return response.data;
};



export const getStations = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('system-administration/stations/');
  return response.data;
};


export const getAttendacetypes = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('system-administration/court-attendance-types/');
  return response.data;
};

//system-administration/court-attendance-types/

export const getOutcomes = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('system-administration/case-outcomes/');
  return response.data;
};


export const getPrisonerDetails = async (id: String): Promise<StageAssignmentPost> => {
  const response = await axiosInstance.get<StageAssignmentPost>(`admission/prisoners/${id}/`);
  return response.data;
};


export const submitCourtSchedule = async (gatePassData: CourtSchedulePost): Promise<StageAssignmentPost> => {
  const response = await axiosInstance.post<StageAssignmentPost>('court-attendance/schedules/', gatePassData);
  return response.data;
};



export const getOffencesPersonal = async (data: OffenceRequest): Promise<OffenceRequest> => {
  const response = await axiosInstance.get<OffenceRequest>('sentence-management/offences/', data);
  return response.data;
};


export const submitCourtScheduleMulti = async (formdata: FormData): Promise<StageAssignmentPost> => {
  const response = await axiosInstance.post<StageAssignmentPost>('court-attendance/schedules/', formdata);
  return response.data;
};

//update 
export const editSchedule = async (visitorPassData: FormData,id:String): Promise<StageAssignmentPost> => {
  const response = await axiosInstance.patch<StageAssignmentPost>('/gate-management/visitor-passes/'+id+'/', visitorPassData);
  //console.log(visitorPassData.id);
  return response.data;
};


//delete gatepass
export const deleteCourtSchedule = async (id:String): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.delete<WorkingPartyResponse[]>(`/court-attendance/schedules/${id}/`);
  return response.data;
};



export const getScheduleList = async (): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.get<WorkingPartyResponse[]>('court-attendance/schedules/');
  return response.data;
};


export const getprisonerAppeals = async (id:String): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`/sentence-management/appeals/?prisoner=${id}`);
  return response.data;
};

//get all appeals
export const getAppeals = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`/sentence-management/appeals/`);
  return response.data;
};


//delete gatepass
export const deleteCourtAttendance = async (id:String): Promise<WorkingPartyResponse[]> => {
  const response = await axiosInstance.delete<WorkingPartyResponse[]>(`/court-attendance/attendance-records/${id}/`);
  return response.data;
};



export const submitCourtAttendance = async (gatePassData: CourtAttendanceRecord): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.post<WorkingPartyResponse>('court-attendance/attendance-records/', gatePassData);
  return response.data;
};

//get attendances
export const getCourtattendance = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`/court-attendance/attendance-records/`);
  return response.data;
};

//get proceedings here
//get attendances
export const getCourtProceedings = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`court-attendance/proceedings/`);
  return response.data;
};

export const postgetCourtProceedings = async (data: CourtProceedingPost): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.post<WorkingPartyResponse>('court-attendance/proceedings/', data);
  return response.data;
};

export const updateCourtProceedings = async (data: CourtProceedingPost): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.put<WorkingPartyResponse>(`court-attendance/proceedings/${data.id}/`, data);
  return response.data;
};

export const deleteCourtProceedings = async (id): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.delete<WorkingPartyResponse>(`court-attendance/proceedings/${id}/`);
  return response.data;
};








//get proceedings here
//get attendances
export const getCourtVisits = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`gate-management/visitors/`);
  return response.data;
};

export const postcourtVisit = async (data: CourtVisitRecord): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.post<WorkingPartyResponse>('gate-management/visitors/', data);
  return response.data;
};

export const updatecourtVisit = async (data: CourtVisitRecord): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.put<WorkingPartyResponse>(`gate-management/visitors/${data.id}/`, data);
  return response.data;
};





export const getvisitorTypes = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`system-administration/visitor-types/`);
  return response.data;
};


export const bulkattendance = async (data: object): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.post<WorkingPartyResponse>('court-attendance/attendance-records/', data);
  return response.data;
};



export const getVisitorStatus = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`gate-management/visitor-statuses/`);
  return response.data;
};








export const getIDTypes = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`system-administration/id-types/`);
  return response.data;
};

export const getrelationShips = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`system-administration/relationships/`);
  return response.data;
};



export const getVisitorItems = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`system-administration/item-categories/`);
  return response.data;
};


export const deleteCourtVisit = async (id): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.delete<WorkingPartyResponse>(`gate-management/visitors/${id}/`);
  return response.data;
};




//court documents
export const getcourtdocuments = async (): Promise<WorkingParty[]> => {
  const response = await axiosInstance.get<WorkingParty[]>(`court-attendance/documents/`);
  return response.data;
};

export const postcourtDocument = async (data: CourtProceedingPost): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.post<WorkingPartyResponse>('court-attendance/documents/', data);
  return response.data;
};

export const updatecourtDocument = async (data: CourtProceedingPost): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.put<WorkingPartyResponse>(`court-attendance/documents/${data.id}/`, data);
  return response.data;
};

export const deleteCourtDocument = async (id:String): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.delete<WorkingPartyResponse>(`court-attendance/documents/${id}/`);
  return response.data;
};



//bulk schedule
export const submitBulkSchedule = async (gatePassData: object): Promise<WorkingPartyResponse> => {
  const response = await axiosInstance.post<WorkingPartyResponse>('court-attendance/schedules/', gatePassData);
  return response.data;
};

