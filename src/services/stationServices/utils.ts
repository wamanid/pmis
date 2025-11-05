import {ManualLockUpItem} from "./manualLockupIntegration";

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