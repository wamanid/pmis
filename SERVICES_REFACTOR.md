# System Administration Services Refactoring

## Overview
The system administration services have been refactored from a single monolithic file into a modular folder structure for better organization and maintainability.

## Changes Made

### New Structure
```
src/services/system_administration/
├── index.ts                      # Central export point
├── regionService.ts              # Region API methods
├── districtService.ts            # District API methods
├── stationService.ts             # Station API methods
└── prisonerCategoryService.ts    # Prisoner Category API methods
```

### Service Files

#### 1. **regionService.ts**
- `fetchRegions(params?)` - Fetch regions with filtering/pagination
- `fetchRegionById(id)` - Fetch single region
- `createRegion(data)` - Create new region
- `updateRegion(id, data)` - Full update region
- `patchRegion(id, data)` - Partial update region
- `deleteRegion(id)` - Delete region

#### 2. **districtService.ts**
- `fetchDistricts(params?)` - Fetch districts with filtering/pagination
- `fetchDistrictById(id)` - Fetch single district
- `createDistrict(data)` - Create new district
- `updateDistrict(id, data)` - Full update district
- `patchDistrict(id, data)` - Partial update district
- `deleteDistrict(id)` - Delete district

#### 3. **stationService.ts**
- `fetchStations(params?)` - Fetch stations with filtering/pagination
- `fetchStationById(id)` - Fetch single station
- `createStation(data)` - Create new station
- `updateStation(id, data)` - Full update station
- `patchStation(id, data)` - Partial update station
- `deleteStation(id)` - Delete station

#### 4. **prisonerCategoryService.ts**
- `fetchPrisonerCategories(params?)` - Fetch prisoner categories with filtering/pagination
- `fetchPrisonerCategoryById(id)` - Fetch single prisoner category
- `createPrisonerCategory(data)` - Create new prisoner category
- `updatePrisonerCategory(id, data)` - Full update prisoner category
- `patchPrisonerCategory(id, data)` - Partial update prisoner category
- `deletePrisonerCategory(id)` - Delete prisoner category

#### 5. **index.ts**
Central export point that re-exports all methods from individual service files.

## Migration Guide

### Old Import Pattern (Deprecated)
```typescript
import { fetchRegions } from '../../services/systemAdministrationService';
```

### New Import Pattern (Recommended)
```typescript
import { fetchRegions } from '../../services/system_administration';
```

### Backward Compatibility
The old `systemAdministrationService.ts` file has been kept for backward compatibility and now re-exports from the new structure. However, it is marked as deprecated and should be migrated to the new import pattern.

## Updated Components
The following components have been updated to use the new import structure:

1. **RegionSelect.tsx** - Uses `fetchRegions`
2. **DistrictSelect.tsx** - Uses `fetchDistricts`
3. **StationSelect.tsx** - Uses `fetchStations`
4. **PrisonerCategorySelect.tsx** - Uses `fetchPrisonerCategories`
5. **LocationFilter.tsx** - Uses `fetchRegionById`, `fetchDistrictById`, `fetchStationById`
6. **StationDetail.tsx** - Uses `fetchStationById`

## Benefits

### 1. **Better Organization**
- Each API resource has its own dedicated file
- Easier to locate and maintain specific functionality
- Clear separation of concerns

### 2. **Improved Maintainability**
- Smaller, focused files are easier to understand
- Changes to one resource don't affect others
- Reduced merge conflicts in team environments

### 3. **Enhanced Scalability**
- Easy to add new services without cluttering a single file
- Can add resource-specific utilities or helpers
- Better support for code splitting and lazy loading

### 4. **Better Developer Experience**
- Faster IDE navigation and autocomplete
- Clearer import statements
- Easier to understand dependencies

## Future Improvements

1. **Remove Deprecated File**: After all code is migrated, remove `systemAdministrationService.ts`
2. **Add Service Tests**: Create unit tests for each service file
3. **Add Request Caching**: Implement caching strategies per service
4. **Add Error Handling**: Standardize error handling across services
5. **Add Request Interceptors**: Add logging, retry logic, etc.

## Notes

- All existing functionality remains unchanged
- API endpoints and request/response formats are identical
- Type definitions remain in `models/system_administration`
- All services use the shared `axiosInstance` for HTTP requests
