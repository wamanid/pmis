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

// Relationship Service
export {
  fetchRelationships,
  fetchRelationshipById,
  createRelationship,
  updateRelationship,
  patchRelationship,
  deleteRelationship
} from './relationshipService';

// ID Type Service
export {
  fetchIdTypes,
  fetchIdTypeById,
  createIdType,
  updateIdType,
  patchIdType,
  deleteIdType
} from './idTypeService';

// Armed Force Service
export {
  fetchArmedForces,
  getArmedForceById,
  createArmedForce,
  updateArmedForce,
  deleteArmedForce
} from './armedForceService';

// Armed Force Status Service
export {
  fetchArmedForceStatuses,
  getArmedForceStatusById,
  createArmedForceStatus,
  updateArmedForceStatus,
  deleteArmedForceStatus
} from './armedForceStatusService';
