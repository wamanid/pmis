/**
 * System Administration Services
 * Centralized export for all system administration API services
 */

// Region Service
export {
  fetchRegions,
  fetchRegionById,
  createRegion,
  updateRegion,
  patchRegion,
  deleteRegion
} from './regionService';

// District Service
export {
  fetchDistricts,
  fetchDistrictById,
  createDistrict,
  updateDistrict,
  patchDistrict,
  deleteDistrict
} from './districtService';

// Station Service
export {
  fetchStations,
  fetchStationById,
  createStation,
  updateStation,
  patchStation,
  deleteStation
} from './stationService';

// Prisoner Category Service
export {
  fetchPrisonerCategories,
  fetchPrisonerCategoryById,
  createPrisonerCategory,
  updatePrisonerCategory,
  patchPrisonerCategory,
  deletePrisonerCategory
} from './prisonerCategoryService';
