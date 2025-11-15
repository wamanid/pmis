import {ManualLockUpItem} from "./manualLockupIntegration";
import {StaffDeploymentResponse, Station} from "./staffDeploymentService"
import {toast} from "sonner";

export const getStationsAndTypes = (lockups: ManualLockUpItem[]) => {
  const uniqueStations = Array.from(
    new Map(
      lockups.map(item => [item.station, { id: item.station, name: item.station_name }])
    ).values()
  );

  // Extract unique types
  const uniqueTypes = Array.from(
    new Map(
      lockups.map(item => [item.type, { id: item.type, name: item.type_name }])
    ).values()
  );

  return {
    stations: uniqueStations,
    types: uniqueTypes,
  };
};

export interface StationFilter {
  station_name: string,
  district_name: string,
  region_name: string,
  count: number
}

export interface DistrictFilter {
  district_name: string,
  region_name: string,
  count: number
}

export interface RegionFilter {
  region_name: string,
  count: number
}

export const getStationSummary = (data: StaffDeploymentResponse[]): StationFilter[] => {
  const stationSummaryMap: Record<string, { district_name: string, region_name: string, count: number }> = {};
  data.forEach(item => {
    const stationName = item.station_name
    const districtName = item.station.district.name
    const regionName = item.station.district.region.name

    const key = `${stationName}-${districtName}-${regionName}`;

    if (stationSummaryMap[key]) {
      stationSummaryMap[key].count++
    }else {
      stationSummaryMap[key] = {
        district_name: districtName,
        region_name: regionName,
        count: 1,
      }
    }
  })

  return Object.keys(stationSummaryMap).map(key => {
    const { district_name, region_name, count } = stationSummaryMap[key];
    return { station_name: key.split('-')[0], district_name, region_name, count };
  })
}

export const getDistrictSummary = (data: StaffDeploymentResponse[]): DistrictFilter[] => {
  const districtSummaryMap: Record<string, { region_name: string, count: number }> = {};
  data.forEach(item => {
    const districtName = item.station.district.name
    const regionName = item.station.district.region.name

    if (districtSummaryMap[districtName]) {
      districtSummaryMap[districtName].count++
    }else {
      districtSummaryMap[districtName] = {
        region_name: regionName,
        count: 1,
      }
    }
  })

  return Object.keys(districtSummaryMap).map(key => {
    const { region_name, count } = districtSummaryMap[key];
    return { district_name: key, region_name, count };
  })
}

export const getRegionSummary = (data: StaffDeploymentResponse[]): RegionFilter[] => {
  const regionSummaryMap: Record<string, { count: number }> = {};

  data.forEach(item => {
    const regionName = item.station.district.region.name;

    if (regionSummaryMap[regionName]) {
      regionSummaryMap[regionName].count++;
    } else {
      regionSummaryMap[regionName] = {
        count: 1,
      };
    }
  });

  return Object.keys(regionSummaryMap).map(key => {
    const { count } = regionSummaryMap[key];
    return { region_name: key, count };
  });
};

export const handleResponseError = (response: any) => {
  if ('error' in response){
    toast.error(response.error);
    return true
  }
  return false
}