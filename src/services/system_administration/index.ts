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

// Sex Service
export {
  fetchSexes,
  fetchSexById,
  createSex,
  updateSex,
  patchSex,
  deleteSex
} from './sexService';

// County Service
export {
  fetchCounties,
  fetchCountyById,
  createCounty,
  updateCounty,
  patchCounty,
  deleteCounty
} from './countyService';

// Sub-County Service
export {
  fetchSubCounties,
  fetchSubCountyById,
  createSubCounty,
  updateSubCounty,
  patchSubCounty,
  deleteSubCounty
} from './subCountyService';

// Parish Service
export {
  fetchParishes,
  fetchParishById,
  createParish,
  updateParish,
  patchParish,
  deleteParish
} from './parishService';

// Village Service
export {
  fetchVillages,
  fetchVillageById,
  createVillage,
  updateVillage,
  patchVillage,
  deleteVillage
} from './villageService';

// Education Level Service
export {
  fetchEducationLevels,
  fetchEducationLevelById,
  createEducationLevel,
  updateEducationLevel,
  patchEducationLevel,
  deleteEducationLevel
} from './educationLevelService';

// Employment Status Service
export {
  fetchEmploymentStatuses,
  fetchEmploymentStatusById,
  createEmploymentStatus,
  updateEmploymentStatus,
  patchEmploymentStatus,
  deleteEmploymentStatus
} from './employmentStatusService';

// Tribe Service
export {
  fetchTribes,
  fetchTribeById,
  createTribe,
  updateTribe,
  patchTribe,
  deleteTribe
} from './tribeService';

// Continent Service
export {
  fetchContinents,
  fetchContinentById,
  createContinent,
  updateContinent,
  patchContinent,
  deleteContinent
} from './continentService';

// Country Service
export {
  fetchCountries,
  fetchCountryById,
  createCountry,
  updateCountry,
  patchCountry,
  deleteCountry
} from './countryService';

// Marital Status Service
export {
  fetchMaritalStatuses,
  fetchMaritalStatusById,
  createMaritalStatus,
  updateMaritalStatus,
  patchMaritalStatus,
  deleteMaritalStatus
} from './maritalStatusService';

// Status of Woman Service
export {
  fetchStatusOfWomen,
  fetchStatusOfWomanById,
  createStatusOfWoman,
  updateStatusOfWoman,
  patchStatusOfWoman,
  deleteStatusOfWoman
} from './statusOfWomanService';
