// Mock API service to simulate station dashboard data based on Django models

// Base interfaces matching Django models
export interface Region {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  region: number;
}

export interface Station {
  id: number;
  name: string;
  district: number;
}

export interface LockupType {
  id: number;
  name: string;
  description: string;
}

export interface PrisonerCategory {
  id: number;
  name: string;
}

export interface Sex {
  id: number;
  name: string;
}

export interface Rank {
  id: number;
  name: string;
}

export interface DeploymentArea {
  id: number;
  name: 'Reception' | 'Prison Farm' | 'Escort' | 'Labour';
  description: string;
}

export interface NatureOfComplaint {
  id: number;
  name: string;
  description: string;
}

export interface ComplaintPriority {
  id: number;
  name: 'Critical' | 'Emergency' | 'Urgent' | 'Normal';
}

// API Response interfaces
export interface StationManualLockup {
  id: number;
  station: number;
  date: string;
  lockup_time: string;
  type: LockupType;
  prisoner_category: PrisonerCategory;
  location: 'court' | 'labour' | 'station';
  sex: Sex;
  count: number;
  created_at: string;
}

export interface StationSystemLockup {
  id: number;
  station: number;
  date: string;
  lockup_time: string;
  type: LockupType;
  prisoner_category: PrisonerCategory;
  location: 'court' | 'labour' | 'station';
  sex: Sex;
  count: number;
  created_at: string;
}

export interface LockupByCategory {
  category: string;
  manual_count: number;
  system_count: number;
  total: number;
}

export interface LockupByType {
  type: string;
  manual_count: number;
  system_count: number;
  total: number;
}

export interface LockupData {
  manual: number;
  system: number;
  total: number;
  trend: number;
  by_location: {
    court: number;
    labour: number;
    station: number;
  };
  by_prisoner_category: LockupByCategory[];
  by_lockup_type: LockupByType[];
}

export interface Block {
  id: number;
  station: number;
  name: string;
  block_number: string;
  capacity: number;
  occupied: number;
  available: number;
  description: string;
}

export interface Ward {
  id: number;
  station: number;
  name: string;
  block: number;
  ward_number: string;
  ward_capacity: number;
  ward_area: string;
  security_classification: string;
}

export interface CongestionLevel {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  percentage: number;
  capacity: number;
  current: number;
  available: number;
  blocks_summary: {
    total_blocks: number;
    overcrowded_blocks: number;
    at_capacity_blocks: number;
  };
}

export interface StationComplaint {
  id: number;
  station: number;
  prisoner: {
    id: number;
    name: string;
    prisoner_number: string;
  };
  complaint: string;
  nature_of_complaint: NatureOfComplaint;
  complaint_priority: ComplaintPriority;
  complaint_date: string;
  complaint_status: 'OPEN' | 'CLOSED';
  complaint_remark: string;
  date_of_response: string | null;
  officer_requested: {
    id: number;
    name: string;
    force_number: string;
  };
  rank: Rank;
  response: string | null;
}

export interface ComplaintStats {
  total: number;
  resolved: number;
  pending: number;
  by_priority: {
    priority: string;
    count: number;
  }[];
  by_nature: {
    name: string;
    count: number;
  }[];
  average_resolution_time: number; // in days
}

export interface AdmissionDischarge {
  date: string;
  admissions: number;
  discharges: number;
  net_change: number;
}

export interface BlockAllocation {
  blockName: string;
  blockNumber: string;
  capacity: number;
  occupied: number;
  available: number;
  wards: {
    ward_name: string;
    ward_capacity: number;
    ward_occupied: number;
  }[];
}

export interface StaffDeployment {
  deployment_area: string;
  assigned: number;
  present: number;
  absent: number;
  by_rank: {
    rank: string;
    assigned: number;
    present: number;
    absent: number;
  }[];
}

export interface StationAttendanceSummary {
  date: string;
  total_staff: number;
  present: number;
  absent: number;
  attendance_rate: number;
}

// Mock API functions - Replace these with actual API calls
const API_BASE_URL = 'https://pmis.angstrom-technologies.ug/api'; // Replace with your actual API base URL
const STATION_ID = 1; // Replace with actual station ID from authentication/context

/**
 * Fetch all regions
 * Endpoint: GET /api/regions
 */
export const fetchRegions = async (): Promise<Region[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/regions`);
  // return await response.json();
  
  return [
    { id: 1, name: 'Central Region' },
    { id: 2, name: 'Eastern Region' },
    { id: 3, name: 'Northern Region' },
    { id: 4, name: 'Western Region' }
  ];
};

/**
 * Fetch districts by region
 * Endpoint: GET /api/districts?region={region_id}
 */
export const fetchDistricts = async (regionId?: number): Promise<District[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const regionParam = regionId ? `?region=${regionId}` : '';
  // const response = await fetch(`${API_BASE_URL}/api/districts${regionParam}`);
  // return await response.json();
  
  const allDistricts = [
    { id: 1, name: 'Kampala', region: 1 },
    { id: 2, name: 'Wakiso', region: 1 },
    { id: 3, name: 'Mukono', region: 1 },
    { id: 4, name: 'Jinja', region: 2 },
    { id: 5, name: 'Mbale', region: 2 },
    { id: 6, name: 'Gulu', region: 3 },
    { id: 7, name: 'Lira', region: 3 },
    { id: 8, name: 'Mbarara', region: 4 },
    { id: 9, name: 'Fort Portal', region: 4 }
  ];
  
  return regionId 
    ? allDistricts.filter(d => d.region === regionId)
    : allDistricts;
};

/**
 * Fetch stations by district
 * Endpoint: GET /api/stations?district={district_id}
 */
export const fetchStations = async (districtId?: number): Promise<Station[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const districtParam = districtId ? `?district=${districtId}` : '';
  // const response = await fetch(`${API_BASE_URL}/api/stations${districtParam}`);
  // return await response.json();
  
  const allStations = [
    { id: 1, name: 'Luzira Upper Prison', district: 1 },
    { id: 2, name: 'Luzira Women Prison', district: 1 },
    { id: 3, name: 'Kigo Prison', district: 2 },
    { id: 4, name: 'Kitalya Prison', district: 2 },
    { id: 5, name: 'Nalufenya Prison', district: 4 },
    { id: 6, name: 'Mbale Prison', district: 5 },
    { id: 7, name: 'Gulu Prison', district: 6 },
    { id: 8, name: 'Mbarara Prison', district: 8 }
  ];
  
  return districtId 
    ? allStations.filter(s => s.district === districtId)
    : allStations;
};

/**
 * Fetch lockup count statistics
 * Endpoint: GET /api/stations/{station_id}/lockups/stats
 */
export const fetchLockupCount = async (): Promise<LockupData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/lockups/stats`);
  // return await response.json();
  
  return {
    manual: 45,
    system: 78,
    total: 123,
    trend: 12.5,
    by_location: {
      court: 35,
      labour: 48,
      station: 40
    },
    by_prisoner_category: [
      { category: 'Convict', manual_count: 18, system_count: 32, total: 50 },
      { category: 'Remand', manual_count: 15, system_count: 28, total: 43 },
      { category: 'Civil Debtor', manual_count: 7, system_count: 12, total: 19 },
      { category: 'Awaiting Trial', manual_count: 5, system_count: 6, total: 11 }
    ],
    by_lockup_type: [
      { type: 'Morning Lockup', manual_count: 20, system_count: 35, total: 55 },
      { type: 'Midday Lockup', manual_count: 15, system_count: 25, total: 40 },
      { type: 'Evening Lockup', manual_count: 10, system_count: 18, total: 28 }
    ]
  };
};

/**
 * Fetch congestion level data
 * Endpoint: GET /api/stations/{station_id}/congestion
 */
export const fetchCongestionLevel = async (): Promise<CongestionLevel> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/congestion`);
  // return await response.json();
  
  return {
    level: 'High',
    percentage: 87,
    capacity: 500,
    current: 435,
    available: 65,
    blocks_summary: {
      total_blocks: 5,
      overcrowded_blocks: 2,
      at_capacity_blocks: 1
    }
  };
};

/**
 * Fetch complaint statistics
 * Endpoint: GET /api/stations/{station_id}/complaints/stats
 */
export const fetchComplaintStats = async (): Promise<ComplaintStats> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/complaints/stats`);
  // return await response.json();
  
  return {
    total: 156,
    resolved: 98,
    pending: 58,
    by_priority: [
      { priority: 'Critical', count: 12 },
      { priority: 'Emergency', count: 25 },
      { priority: 'Urgent', count: 48 },
      { priority: 'Normal', count: 71 }
    ],
    by_nature: [
      { name: 'Facility', count: 45 },
      { name: 'Medical', count: 32 },
      { name: 'Food', count: 28 },
      { name: 'Staff Conduct', count: 21 },
      { name: 'Other', count: 30 }
    ],
    average_resolution_time: 3.5
  };
};

/**
 * Fetch admission and discharge data
 * Endpoint: GET /api/stations/{station_id}/admissions-discharges?days=7
 */
export const fetchAdmissionDischarge = async (days: number = 7): Promise<AdmissionDischarge[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/admissions-discharges?days=${days}`);
  // return await response.json();
  
  return [
    { date: 'Oct 8', admissions: 12, discharges: 8, net_change: 4 },
    { date: 'Oct 9', admissions: 15, discharges: 10, net_change: 5 },
    { date: 'Oct 10', admissions: 18, discharges: 12, net_change: 6 },
    { date: 'Oct 11', admissions: 10, discharges: 15, net_change: -5 },
    { date: 'Oct 12', admissions: 14, discharges: 9, net_change: 5 },
    { date: 'Oct 13', admissions: 16, discharges: 11, net_change: 5 },
    { date: 'Oct 14', admissions: 13, discharges: 14, net_change: -1 }
  ];
};

/**
 * Fetch block allocation summary
 * Endpoint: GET /api/stations/{station_id}/blocks/allocation
 */
export const fetchBlockAllocation = async (): Promise<BlockAllocation[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/blocks/allocation`);
  // return await response.json();
  
  return [
    { 
      blockName: 'Maximum Security Block', 
      blockNumber: 'A-001',
      capacity: 100, 
      occupied: 87, 
      available: 13,
      wards: [
        { ward_name: 'Ward A1', ward_capacity: 50, ward_occupied: 45 },
        { ward_name: 'Ward A2', ward_capacity: 50, ward_occupied: 42 }
      ]
    },
    { 
      blockName: 'Medium Security Block', 
      blockNumber: 'B-002',
      capacity: 120, 
      occupied: 95, 
      available: 25,
      wards: [
        { ward_name: 'Ward B1', ward_capacity: 60, ward_occupied: 50 },
        { ward_name: 'Ward B2', ward_capacity: 60, ward_occupied: 45 }
      ]
    },
    { 
      blockName: 'Minimum Security Block', 
      blockNumber: 'C-003',
      capacity: 80, 
      occupied: 72, 
      available: 8,
      wards: [
        { ward_name: 'Ward C1', ward_capacity: 40, ward_occupied: 36 },
        { ward_name: 'Ward C2', ward_capacity: 40, ward_occupied: 36 }
      ]
    },
    { 
      blockName: 'Female Block', 
      blockNumber: 'D-004',
      capacity: 90, 
      occupied: 81, 
      available: 9,
      wards: [
        { ward_name: 'Ward D1', ward_capacity: 45, ward_occupied: 40 },
        { ward_name: 'Ward D2', ward_capacity: 45, ward_occupied: 41 }
      ]
    },
    { 
      blockName: 'Remand Block', 
      blockNumber: 'E-005',
      capacity: 110, 
      occupied: 100, 
      available: 10,
      wards: [
        { ward_name: 'Ward E1', ward_capacity: 55, ward_occupied: 50 },
        { ward_name: 'Ward E2', ward_capacity: 55, ward_occupied: 50 }
      ]
    }
  ];
};

/**
 * Fetch staff deployment by area
 * Endpoint: GET /api/stations/{station_id}/staff/deployment
 */
export const fetchStaffDeployment = async (): Promise<StaffDeployment[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/staff/deployment`);
  // return await response.json();
  
  return [
    { 
      deployment_area: 'Reception', 
      assigned: 45, 
      present: 42, 
      absent: 3,
      by_rank: [
        { rank: 'Inspector', assigned: 5, present: 5, absent: 0 },
        { rank: 'Sergeant', assigned: 10, present: 9, absent: 1 },
        { rank: 'Corporal', assigned: 15, present: 14, absent: 1 },
        { rank: 'Constable', assigned: 15, present: 14, absent: 1 }
      ]
    },
    { 
      deployment_area: 'Prison Farm', 
      assigned: 28, 
      present: 26, 
      absent: 2,
      by_rank: [
        { rank: 'Sergeant', assigned: 5, present: 5, absent: 0 },
        { rank: 'Corporal', assigned: 10, present: 9, absent: 1 },
        { rank: 'Constable', assigned: 13, present: 12, absent: 1 }
      ]
    },
    { 
      deployment_area: 'Escort', 
      assigned: 35, 
      present: 33, 
      absent: 2,
      by_rank: [
        { rank: 'Inspector', assigned: 3, present: 3, absent: 0 },
        { rank: 'Sergeant', assigned: 8, present: 7, absent: 1 },
        { rank: 'Corporal', assigned: 12, present: 12, absent: 0 },
        { rank: 'Constable', assigned: 12, present: 11, absent: 1 }
      ]
    },
    { 
      deployment_area: 'Labour', 
      assigned: 20, 
      present: 19, 
      absent: 1,
      by_rank: [
        { rank: 'Sergeant', assigned: 4, present: 4, absent: 0 },
        { rank: 'Corporal', assigned: 8, present: 8, absent: 0 },
        { rank: 'Constable', assigned: 8, present: 7, absent: 1 }
      ]
    }
  ];
};

/**
 * Fetch manual lockup records
 * Endpoint: GET /api/stations/{station_id}/lockups/manual?date={date}
 */
export const fetchManualLockups = async (date?: string): Promise<StationManualLockup[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const dateParam = date ? `?date=${date}` : '';
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/lockups/manual${dateParam}`);
  // return await response.json();
  
  return [
    {
      id: 1,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 770, name: 'Convict' },
      location: 'station',
      sex: { id: 880, name: 'Male' },
      count: 45,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 2,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 770, name: 'Convict' },
      location: 'court',
      sex: { id: 880, name: 'Male' },
      count: 8,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 3,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 771, name: 'Remand' },
      location: 'station',
      sex: { id: 880, name: 'Male' },
      count: 32,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 4,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 770, name: 'Convict' },
      location: 'station',
      sex: { id: 881, name: 'Female' },
      count: 12,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 5,
      station: 1,
      date: '2025-10-20',
      lockup_time: '12:30',
      type: { id: 661, name: 'Midday', description: 'Midday lockup check' },
      prisoner_category: { id: 772, name: 'Civil Debtor' },
      location: 'station',
      sex: { id: 880, name: 'Male' },
      count: 5,
      created_at: '2025-10-20T12:30:00Z'
    }
  ];
};

/**
 * Fetch system lockup records
 * Endpoint: GET /api/stations/{station_id}/lockups/system?date={date}
 */
export const fetchSystemLockups = async (date?: string): Promise<StationSystemLockup[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const dateParam = date ? `?date=${date}` : '';
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/lockups/system${dateParam}`);
  // return await response.json();
  
  return [
    {
      id: 101,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 770, name: 'Convict' },
      location: 'station',
      sex: { id: 880, name: 'Male' },
      count: 50,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 102,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 770, name: 'Convict' },
      location: 'labour',
      sex: { id: 880, name: 'Male' },
      count: 10,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 103,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 771, name: 'Remand' },
      location: 'station',
      sex: { id: 880, name: 'Male' },
      count: 28,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 104,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 770, name: 'Convict' },
      location: 'station',
      sex: { id: 881, name: 'Female' },
      count: 15,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 105,
      station: 1,
      date: '2025-10-20',
      lockup_time: '08:00',
      type: { id: 660, name: 'Morning Lockup', description: 'Morning lockup check' },
      prisoner_category: { id: 772, name: 'Civil Debtor' },
      location: 'station',
      sex: { id: 880, name: 'Male' },
      count: 5,
      created_at: '2025-10-20T08:00:00Z'
    },
    {
      id: 106,
      station: 1,
      date: '2025-10-20',
      lockup_time: '12:30',
      type: { id: 661, name: 'Midday', description: 'Midday lockup check' },
      prisoner_category: { id: 771, name: 'Remand' },
      location: 'station',
      sex: { id: 880, name: 'Male' },
      count: 20,
      created_at: '2025-10-20T12:30:00Z'
    }
  ];
};

/**
 * Fetch all complaints
 * Endpoint: GET /api/stations/{station_id}/complaints?status={status}
 */
export const fetchComplaints = async (status?: 'OPEN' | 'CLOSED'): Promise<StationComplaint[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const statusParam = status ? `?status=${status}` : '';
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/complaints${statusParam}`);
  // return await response.json();
  
  return [];
};

// Admission-related interfaces
export interface AdmissionsByCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface AdmissionsByAgeGroup {
  ageGroup: string;
  count: number;
}

export interface AdmissionTrend {
  date: string;
  admissions: number;
}

export interface PrisonerSearchResult {
  id: number;
  prisoner_number: string;
  full_name: string;
  category: string;
  date_of_admission: string;
  status: string;
}

export interface AdmissionStats {
  total_admissions: number;
  by_category: AdmissionsByCategory[];
  pending_approval: number;
  armed_personnel: number;
  children_admitted: number;
  weekly_summary: {
    current_week: number;
    previous_week: number;
    change_percentage: number;
  };
  monthly_summary: {
    current_month: number;
    previous_month: number;
    change_percentage: number;
  };
  trend_data: AdmissionTrend[];
  by_age_group: AdmissionsByAgeGroup[];
}

/**
 * Fetch admission statistics
 * Endpoint: GET /api/stations/{station_id}/admissions/stats
 */
export const fetchAdmissionStats = async (): Promise<AdmissionStats> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/admissions/stats`);
  // return await response.json();
  
  return {
    total_admissions: 245,
    by_category: [
      { category: 'Convict', count: 98, percentage: 40 },
      { category: 'Remand', count: 73, percentage: 30 },
      { category: 'Civil Debtor', count: 37, percentage: 15 },
      { category: 'Condemned/Lifers', count: 24, percentage: 10 },
      { category: 'Lodgers', count: 13, percentage: 5 }
    ],
    pending_approval: 18,
    armed_personnel: 5,
    children_admitted: 12,
    weekly_summary: {
      current_week: 32,
      previous_week: 28,
      change_percentage: 14.3
    },
    monthly_summary: {
      current_month: 124,
      previous_month: 108,
      change_percentage: 14.8
    },
    trend_data: [
      { date: 'Oct 1', admissions: 15 },
      { date: 'Oct 2', admissions: 12 },
      { date: 'Oct 3', admissions: 18 },
      { date: 'Oct 4', admissions: 14 },
      { date: 'Oct 5', admissions: 10 },
      { date: 'Oct 6', admissions: 16 },
      { date: 'Oct 7', admissions: 13 },
      { date: 'Oct 8', admissions: 12 },
      { date: 'Oct 9', admissions: 15 },
      { date: 'Oct 10', admissions: 18 },
      { date: 'Oct 11', admissions: 10 },
      { date: 'Oct 12', admissions: 14 },
      { date: 'Oct 13', admissions: 16 },
      { date: 'Oct 14', admissions: 13 }
    ],
    by_age_group: [
      { ageGroup: '18-25', count: 68 },
      { ageGroup: '26-35', count: 92 },
      { ageGroup: '36-45', count: 54 },
      { ageGroup: '46-55', count: 21 },
      { ageGroup: '56+', count: 10 }
    ]
  };
};

// Menu-related interfaces
export interface MenuItem {
  id: string;
  parent_name: string | null;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  name: string;
  url: string;
  icon: string;
  created_by: number | null;
  updated_by: number | null;
  deleted_by: number | null;
  parent: string | null;
}

export interface MenuApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MenuItem[];
}

/**
 * Fetch menu items from system administration
 * Endpoint: GET /api/system-administration/menus/
 */
export const fetchMenus = async (): Promise<MenuApiResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/system-administration/menus/`);
  // return await response.json();
  
  // Mock menu data based on the requirements
  return {
    count: 28,
    next: null,
    previous: null,
    results: [
      {
        id: "1",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Station Management",
        url: "/station-management",
        icon: "Building2",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "2",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Admissions Management",
        url: "/admissions-management",
        icon: "UserPlus",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "3",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Sentence Management",
        url: "/sentence-management",
        icon: "Gavel",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "4",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Property Management",
        url: "/property-management",
        icon: "Package",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "5",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Court Attendance",
        url: "/court-attendance",
        icon: "Scale",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "6",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Classification & Progressive Stage System",
        url: "/classification-progressive",
        icon: "TrendingUp",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "7",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Automated Gate Management",
        url: "/gate-management",
        icon: "DoorOpen",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "8",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Transfer Management",
        url: "/transfer-management",
        icon: "ArrowLeftRight",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "9",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Medical Records Management",
        url: "/medical-records",
        icon: "Stethoscope",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "10",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Discharge & Exit Management",
        url: "/discharge-exit",
        icon: "LogOut",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "11",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Discipline Management",
        url: "/discipline-management",
        icon: "AlertTriangle",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "12",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Rehabilitation & Reintegration",
        url: "/rehabilitation",
        icon: "HeartHandshake",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "13",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Earning Scheme & Gratuity",
        url: "/earning-scheme",
        icon: "DollarSign",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "14",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Biometrics Management",
        url: "/biometrics",
        icon: "Fingerprint",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "15",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Reports",
        url: "/reports",
        icon: "FileText",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      {
        id: "16",
        parent_name: null,
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Profile & Settings",
        url: "/profile-settings",
        icon: "Settings",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: null
      },
      // Station Management Sub-menus
      {
        id: "1-0",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Station Overview",
        url: "/station-management/overview",
        icon: "Building2",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      {
        id: "1-1",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Lockup",
        url: "/station-management/lockup",
        icon: "Lock",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      {
        id: "1-1-1",
        parent_name: "Lockup",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Manual",
        url: "/station-management/lockup/manual",
        icon: "Lock",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1-1"
      },
      {
        id: "1-1-2",
        parent_name: "Lockup",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "System",
        url: "/station-management/lockup/system",
        icon: "Lock",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1-1"
      },
      {
        id: "1-2",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Staff Deployments",
        url: "/station-management/staff-deployment",
        icon: "Users",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      {
        id: "1-3",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Letters & Phone Calls",
        url: "/station-management/letters-phone",
        icon: "Phone",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      {
        id: "1-4",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Housing Allocation & Congestion Levels",
        url: "/station-management/housing",
        icon: "Home",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      {
        id: "1-5",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Entry and Exit",
        url: "/station-management/entry-exit",
        icon: "LogIn",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      {
        id: "1-5-1",
        parent_name: "Entry and Exit",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Staff",
        url: "/station-management/entry-exit/staff",
        icon: "Users",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1-5"
      },
      {
        id: "1-5-2",
        parent_name: "Entry and Exit",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Prisoners",
        url: "/station-management/entry-exit/prisoners",
        icon: "Users",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1-5"
      },
      {
        id: "1-6",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Journals",
        url: "/station-management/journals",
        icon: "BookOpen",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      {
        id: "1-7",
        parent_name: "Station Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Complaints",
        url: "/station-management/complaints",
        icon: "MessageSquare",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "1"
      },
      // Admissions Management Sub-menus
      {
        id: "2-1",
        parent_name: "Admissions Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Admissions",
        url: "/admissions-management/admissions",
        icon: "UserPlus",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "2"
      },
      {
        id: "2-2",
        parent_name: "Admissions Management",
        created_datetime: "2025-10-20T09:53:28.460Z",
        is_active: true,
        updated_datetime: "2025-10-20T09:53:28.460Z",
        deleted_datetime: null,
        name: "Pending Approvals",
        url: "/admissions-management/pending-approvals",
        icon: "ClipboardCheck",
        created_by: 1,
        updated_by: null,
        deleted_by: null,
        parent: "2"
      }
    ]
  };
};

/**
 * Search prisoners
 * Endpoint: GET /api/stations/{station_id}/prisoners/search?query={query}
 */
export const searchPrisoners = async (query: string): Promise<PrisonerSearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/stations/${STATION_ID}/prisoners/search?query=${encodeURIComponent(query)}`);
  // return await response.json();
  
  if (!query) return [];
  
  const mockPrisoners: PrisonerSearchResult[] = [
    { id: 1, prisoner_number: 'P-2024-001', full_name: 'John Doe', category: 'Convict', date_of_admission: '2024-01-15', status: 'Active' },
    { id: 2, prisoner_number: 'P-2024-002', full_name: 'Jane Smith', category: 'Remand', date_of_admission: '2024-02-20', status: 'Active' },
    { id: 3, prisoner_number: 'P-2024-003', full_name: 'Robert Johnson', category: 'Civil Debtor', date_of_admission: '2024-03-10', status: 'Active' },
    { id: 4, prisoner_number: 'P-2024-004', full_name: 'Mary Williams', category: 'Convict', date_of_admission: '2024-04-05', status: 'Active' },
    { id: 5, prisoner_number: 'P-2024-005', full_name: 'James Brown', category: 'Lodgers', date_of_admission: '2024-05-12', status: 'Active' }
  ];
  
  return mockPrisoners.filter(p => 
    p.full_name.toLowerCase().includes(query.toLowerCase()) ||
    p.prisoner_number.toLowerCase().includes(query.toLowerCase())
  );
};

// HRMIS API Interfaces
export interface HRMISStaff {
  force_number: string;
  name: string;
  rank: string;
  dob: string;
}

// Staff Deployment API Interfaces (matching Django API)
export interface StaffDeploymentRecord {
  id: string;
  station_name: string;
  created_by_name: string;
  full_name: string;
  created_datetime: string;
  is_active: boolean;
  updated_datetime: string;
  deleted_datetime: string | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  force_number: string;
  profile: string;
  age_at_deployment: number;
  date_of_birth: string;
  rank: string;
  start_date: string;
  end_date: string | null;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
  station: string;
}

export interface StaffDeploymentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffDeploymentRecord[];
}

export interface StaffDeploymentSummary {
  by_station: {
    station_id: number;
    station_name: string;
    district_name: string;
    region_name: string;
    staff_count: number;
  }[];
  by_district: {
    district_id: number;
    district_name: string;
    region_name: string;
    staff_count: number;
  }[];
  by_region: {
    region_id: number;
    region_name: string;
    staff_count: number;
  }[];
  total_staff: number;
  deployed_staff: number;
}

export interface CreateStaffDeploymentRequest {
  first_name: string;
  middle_name: string;
  last_name: string;
  force_number: string;
  date_of_birth: string;
  rank: string;
  station: string;
  start_date: string;
  end_date?: string;
}

// Mock data store for staff deployments (persists during session)
let mockDeploymentStore: StaffDeploymentRecord[] = [
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa1',
    station_name: 'Luzira Upper Prison',
    created_by_name: 'Admin User',
    full_name: 'John Kamau',
    created_datetime: '2024-01-15T08:00:00Z',
    is_active: true,
    updated_datetime: '2024-01-15T08:00:00Z',
    deleted_datetime: null,
    first_name: 'John',
    middle_name: '',
    last_name: 'Kamau',
    force_number: 'UPS-001234',
    profile: 'Staff Officer',
    age_at_deployment: 39,
    date_of_birth: '1985-03-15',
    rank: 'Inspector',
    start_date: '2024-01-15',
    end_date: null,
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    station: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa2',
    station_name: 'Luzira Upper Prison',
    created_by_name: 'Admin User',
    full_name: 'Sarah Nakato',
    created_datetime: '2024-02-10T08:00:00Z',
    is_active: true,
    updated_datetime: '2024-02-10T08:00:00Z',
    deleted_datetime: null,
    first_name: 'Sarah',
    middle_name: '',
    last_name: 'Nakato',
    force_number: 'UPS-001235',
    profile: 'Staff Officer',
    age_at_deployment: 36,
    date_of_birth: '1988-07-22',
    rank: 'Sergeant',
    start_date: '2024-02-10',
    end_date: null,
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    station: '550e8400-e29b-41d4-a716-446655440001'
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa3',
    station_name: 'Luzira Women Prison',
    created_by_name: 'Admin User',
    full_name: 'David Omondi',
    created_datetime: '2024-03-05T08:00:00Z',
    is_active: true,
    updated_datetime: '2024-03-05T08:00:00Z',
    deleted_datetime: null,
    first_name: 'David',
    middle_name: '',
    last_name: 'Omondi',
    force_number: 'UPS-001236',
    profile: 'Staff Officer',
    age_at_deployment: 34,
    date_of_birth: '1990-11-10',
    rank: 'Corporal',
    start_date: '2024-03-05',
    end_date: null,
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    station: '550e8400-e29b-41d4-a716-446655440002'
  }
];

/**
 * Search HRMIS for staff by force number or name
 * Endpoint: GET /api/hrmis/staff/search?query={query}
 */
export const searchHRMISStaff = async (query: string): Promise<HRMISStaff[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual HRMIS API call
  // const response = await fetch(`${API_BASE_URL}/api/hrmis/staff/search?query=${encodeURIComponent(query)}`);
  // return await response.json();
  
  if (!query || query.length < 2) return [];
  
  const mockHRMISStaff: HRMISStaff[] = [
    // Senior Officers
    { force_number: 'UPS-000101', name: 'Johnson Okello Mubiru', rank: 'Commissioner', dob: '1975-03-12' },
    { force_number: 'UPS-000102', name: 'Catherine Namukasa', rank: 'Deputy Commissioner', dob: '1978-08-22' },
    { force_number: 'UPS-000103', name: 'Patrick Mukwano', rank: 'Assistant Commissioner', dob: '1980-11-05' },
    { force_number: 'UPS-000104', name: 'Jane Nakato Wasswa', rank: 'Senior Superintendent', dob: '1982-05-18' },
    { force_number: 'UPS-000105', name: 'David Okwir', rank: 'Senior Superintendent', dob: '1981-09-30' },
    
    // Superintendents
    { force_number: 'UPS-000201', name: 'Henry Musinguzi', rank: 'Superintendent', dob: '1983-02-14' },
    { force_number: 'UPS-000202', name: 'Margaret Achieng', rank: 'Superintendent', dob: '1984-07-08' },
    { force_number: 'UPS-000203', name: 'Francis Waiswa', rank: 'Superintendent', dob: '1985-12-20' },
    { force_number: 'UPS-000204', name: 'Rose Nakitende', rank: 'Assistant Superintendent', dob: '1986-04-25' },
    { force_number: 'UPS-000205', name: 'Samuel Otim', rank: 'Assistant Superintendent', dob: '1987-10-11' },
    
    // Inspectors
    { force_number: 'UPS-001234', name: 'John Kamau', rank: 'Inspector', dob: '1985-03-15' },
    { force_number: 'UPS-001235', name: 'Sarah Nakato', rank: 'Inspector', dob: '1988-07-22' },
    { force_number: 'UPS-001236', name: 'David Omondi', rank: 'Inspector', dob: '1990-11-10' },
    { force_number: 'UPS-001239', name: 'Mary Nakabugo', rank: 'Inspector', dob: '1984-12-30' },
    { force_number: 'UPS-001243', name: 'Rebecca Namuli', rank: 'Inspector', dob: '1985-10-12' },
    { force_number: 'UPS-001301', name: 'Andrew Kisakye', rank: 'Inspector', dob: '1989-06-18' },
    { force_number: 'UPS-001302', name: 'Stella Achola', rank: 'Inspector', dob: '1991-01-22' },
    { force_number: 'UPS-001303', name: 'George Wafula', rank: 'Inspector', dob: '1988-09-14' },
    { force_number: 'UPS-001304', name: 'Joyce Nambi', rank: 'Inspector', dob: '1990-03-28' },
    { force_number: 'UPS-001305', name: 'Kenneth Opio', rank: 'Inspector', dob: '1987-11-05' },
    
    // Sergeants
    { force_number: 'UPS-001238', name: 'Peter Musoke', rank: 'Sergeant', dob: '1987-09-05' },
    { force_number: 'UPS-001242', name: 'Robert Wangolo', rank: 'Sergeant', dob: '1986-02-20' },
    { force_number: 'UPS-002001', name: 'Vincent Tumusiime', rank: 'Sergeant', dob: '1990-05-12' },
    { force_number: 'UPS-002002', name: 'Agnes Mutesi', rank: 'Sergeant', dob: '1991-08-30' },
    { force_number: 'UPS-002003', name: 'Emmanuel Ssekandi', rank: 'Sergeant', dob: '1989-12-15' },
    { force_number: 'UPS-002004', name: 'Florence Nabirye', rank: 'Sergeant', dob: '1992-03-07' },
    { force_number: 'UPS-002005', name: 'Julius Okumu', rank: 'Sergeant', dob: '1988-07-19' },
    { force_number: 'UPS-002006', name: 'Harriet Namugga', rank: 'Sergeant', dob: '1993-11-22' },
    { force_number: 'UPS-002007', name: 'Martin Kaggwa', rank: 'Sergeant', dob: '1990-02-28' },
    { force_number: 'UPS-002008', name: 'Patricia Akello', rank: 'Sergeant', dob: '1991-06-14' },
    { force_number: 'UPS-002009', name: 'Bernard Lubega', rank: 'Sergeant', dob: '1989-10-03' },
    { force_number: 'UPS-002010', name: 'Christine Nyeko', rank: 'Sergeant', dob: '1992-04-16' },
    
    // Corporals
    { force_number: 'UPS-001240', name: 'James Okello', rank: 'Corporal', dob: '1991-06-14' },
    { force_number: 'UPS-001244', name: 'Moses Kizito', rank: 'Corporal', dob: '1989-05-08' },
    { force_number: 'UPS-003001', name: 'Isaac Byaruhanga', rank: 'Corporal', dob: '1993-01-25' },
    { force_number: 'UPS-003002', name: 'Juliet Nankya', rank: 'Corporal', dob: '1994-05-11' },
    { force_number: 'UPS-003003', name: 'Ronald Asiimwe', rank: 'Corporal', dob: '1992-09-18' },
    { force_number: 'UPS-003004', name: 'Brenda Atim', rank: 'Corporal', dob: '1995-02-07' },
    { force_number: 'UPS-003005', name: 'Daniel Mugisha', rank: 'Corporal', dob: '1991-07-30' },
    { force_number: 'UPS-003006', name: 'Edith Namayanja', rank: 'Corporal', dob: '1993-12-14' },
    { force_number: 'UPS-003007', name: 'Fred Kamugisha', rank: 'Corporal', dob: '1990-04-22' },
    { force_number: 'UPS-003008', name: 'Grace Amongi', rank: 'Corporal', dob: '1994-08-09' },
    { force_number: 'UPS-003009', name: 'Herbert Mwesigwa', rank: 'Corporal', dob: '1992-11-27' },
    { force_number: 'UPS-003010', name: 'Irene Namuddu', rank: 'Corporal', dob: '1995-03-15' },
    
    // Constables
    { force_number: 'UPS-001237', name: 'Grace Auma', rank: 'Constable', dob: '1992-04-18' },
    { force_number: 'UPS-001241', name: 'Alice Akello', rank: 'Constable', dob: '1993-08-25' },
    { force_number: 'UPS-001245', name: 'Elizabeth Nabirye', rank: 'Constable', dob: '1994-01-17' },
    { force_number: 'UPS-004001', name: 'Joseph Mulindwa', rank: 'Constable', dob: '1995-06-20' },
    { force_number: 'UPS-004002', name: 'Lydia Namukwaya', rank: 'Constable', dob: '1996-10-12' },
    { force_number: 'UPS-004003', name: 'Michael Wanyama', rank: 'Constable', dob: '1994-02-28' },
    { force_number: 'UPS-004004', name: 'Nancy Nakku', rank: 'Constable', dob: '1997-07-05' },
    { force_number: 'UPS-004005', name: 'Oscar Ssemakula', rank: 'Constable', dob: '1995-11-18' },
    { force_number: 'UPS-004006', name: 'Priscilla Achan', rank: 'Constable', dob: '1996-03-30' },
    { force_number: 'UPS-004007', name: 'Richard Oketch', rank: 'Constable', dob: '1993-08-14' },
    { force_number: 'UPS-004008', name: 'Susan Namazzi', rank: 'Constable', dob: '1997-12-22' },
    { force_number: 'UPS-004009', name: 'Timothy Ochen', rank: 'Constable', dob: '1995-04-09' },
    { force_number: 'UPS-004010', name: 'Vivian Nassuna', rank: 'Constable', dob: '1998-09-16' },
    { force_number: 'UPS-004011', name: 'William Lubowa', rank: 'Constable', dob: '1994-01-28' },
    { force_number: 'UPS-004012', name: 'Yvonne Mirembe', rank: 'Constable', dob: '1996-05-11' },
    { force_number: 'UPS-004013', name: 'Zachary Odongo', rank: 'Constable', dob: '1997-10-03' },
    { force_number: 'UPS-004014', name: 'Annet Kiconco', rank: 'Constable', dob: '1995-02-14' },
    { force_number: 'UPS-004015', name: 'Brian Kato', rank: 'Constable', dob: '1998-06-27' },
    { force_number: 'UPS-004016', name: 'Caroline Nabwire', rank: 'Constable', dob: '1996-11-08' },
    { force_number: 'UPS-004017', name: 'Denis Ssozi', rank: 'Constable', dob: '1994-03-19' },
    { force_number: 'UPS-004018', name: 'Esther Acheng', rank: 'Constable', dob: '1997-07-31' },
    { force_number: 'UPS-004019', name: 'Felix Tumwine', rank: 'Constable', dob: '1995-12-12' },
    { force_number: 'UPS-004020', name: 'Gertrude Nalweyiso', rank: 'Constable', dob: '1998-04-25' }
  ];
  
  return mockHRMISStaff.filter(s => 
    s.force_number.toLowerCase().includes(query.toLowerCase()) ||
    s.name.toLowerCase().includes(query.toLowerCase())
  );
};

/**
 * Fetch staff deployment records
 * Endpoint: GET /api/station-management/api/staff-deployments/
 */
export const fetchStaffDeployments = async (filters?: {
  station?: string;
  is_active?: boolean;
}): Promise<StaffDeploymentListResponse> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const params = new URLSearchParams();
  // if (filters?.station) params.append('station', filters.station);
  // if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
  // const response = await fetch(`${API_BASE_URL}/api/station-management/api/staff-deployments/?${params}`);
  // return await response.json();
  
  // Apply filters
  let filteredDeployments = mockDeploymentStore;
  
  if (filters?.station) {
    filteredDeployments = filteredDeployments.filter(d => d.station === filters.station);
  }
  
  if (filters?.is_active !== undefined) {
    filteredDeployments = filteredDeployments.filter(d => d.is_active === filters.is_active);
  }
  
  return {
    count: filteredDeployments.length,
    next: null,
    previous: null,
    results: filteredDeployments
  };
};

/**
 * Fetch staff deployment summary
 * Endpoint: GET /api/staff/deployment-summary
 */
export const fetchStaffDeploymentSummary = async (): Promise<StaffDeploymentSummary> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/staff/deployment-summary`);
  // return await response.json();
  
  const activeDeployments = mockDeploymentStore.filter(d => d.is_active);
  
  // Get all stations, districts, regions for proper mapping
  const stations = await fetchStations();
  const districts = await fetchDistricts();
  const regions = await fetchRegions();
  
  // Group by station
  const stationMap = new Map<string, { station: Station; count: number }>();
  activeDeployments.forEach(deployment => {
    const station = stations.find(s => s.id.toString() === deployment.station);
    if (station) {
      const key = station.id.toString();
      if (!stationMap.has(key)) {
        stationMap.set(key, { station, count: 0 });
      }
      stationMap.get(key)!.count++;
    }
  });
  
  // Group by district
  const districtMap = new Map<number, { district: District; count: number }>();
  stationMap.forEach(({ station, count }) => {
    const district = districts.find(d => d.id === station.district);
    if (district) {
      if (!districtMap.has(district.id)) {
        districtMap.set(district.id, { district, count: 0 });
      }
      districtMap.get(district.id)!.count += count;
    }
  });
  
  // Group by region
  const regionMap = new Map<number, { region: Region; count: number }>();
  districtMap.forEach(({ district, count }) => {
    const region = regions.find(r => r.id === district.region);
    if (region) {
      if (!regionMap.has(region.id)) {
        regionMap.set(region.id, { region, count: 0 });
      }
      regionMap.get(region.id)!.count += count;
    }
  });
  
  return {
    by_station: Array.from(stationMap.values()).map(({ station, count }) => {
      const district = districts.find(d => d.id === station.district);
      const region = district ? regions.find(r => r.id === district.region) : null;
      return {
        station_id: station.id,
        station_name: station.name,
        district_name: district?.name || 'Unknown',
        region_name: region?.name || 'Unknown',
        staff_count: count
      };
    }),
    by_district: Array.from(districtMap.values()).map(({ district, count }) => {
      const region = regions.find(r => r.id === district.region);
      return {
        district_id: district.id,
        district_name: district.name,
        region_name: region?.name || 'Unknown',
        staff_count: count
      };
    }),
    by_region: Array.from(regionMap.values()).map(({ region, count }) => ({
      region_id: region.id,
      region_name: region.name,
      staff_count: count
    })),
    total_staff: activeDeployments.length,
    deployed_staff: activeDeployments.length
  };
};

/**
 * Create staff deployment
 * Endpoint: POST /api/station-management/api/staff-deployments/
 */
export const createStaffDeployment = async (deployment: CreateStaffDeploymentRequest): Promise<StaffDeploymentRecord> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/api/station-management/api/staff-deployments/`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(deployment)
  // });
  // return await response.json();
  
  const dob = new Date(deployment.date_of_birth);
  const age = Math.floor((new Date().getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Get station name from station lookup
  const stations = await fetchStations();
  const station = stations.find(s => s.id.toString() === deployment.station);
  const stationName = station ? station.name : 'Unknown Station';
  
  const newDeployment: StaffDeploymentRecord = {
    id: `3fa85f64-5717-4562-b3fc-${Math.random().toString(16).slice(2, 14)}`,
    station_name: stationName,
    created_by_name: 'Current User',
    full_name: `${deployment.first_name} ${deployment.middle_name} ${deployment.last_name}`.trim().replace(/\s+/g, ' '),
    created_datetime: new Date().toISOString(),
    is_active: true,
    updated_datetime: new Date().toISOString(),
    deleted_datetime: null,
    first_name: deployment.first_name,
    middle_name: deployment.middle_name,
    last_name: deployment.last_name,
    force_number: deployment.force_number,
    profile: 'Staff Officer',
    age_at_deployment: age,
    date_of_birth: deployment.date_of_birth,
    rank: deployment.rank,
    start_date: deployment.start_date,
    end_date: deployment.end_date || null,
    created_by: 1,
    updated_by: null,
    deleted_by: null,
    station: deployment.station
  };
  
  // Add to mock store
  mockDeploymentStore.push(newDeployment);
  
  return newDeployment;
};
