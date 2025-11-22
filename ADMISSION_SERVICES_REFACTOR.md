# Admission Services Refactoring

## Overview
The admission services have been refactored from a single monolithic file into a modular folder structure for better organization and maintainability.

## Changes Made

### New Structure
```
src/services/admission/
├── index.ts                # Central export point
├── dashboardService.ts     # Dashboard API methods
└── prisonerService.ts      # Prisoner API methods
```

### Service Files

#### 1. **dashboardService.ts**
- `getAdmissionDashboard(filters?)` - Fetch admission dashboard statistics with optional filters

#### 2. **prisonerService.ts**
- `getPrisoners(filters?)` - Fetch list of prisoners with filtering/pagination
- `getPrisonerById(id)` - Fetch single prisoner details

#### 3. **index.ts**
Central export point that re-exports all methods from individual service files and provides a default `admissionService` object for backward compatibility.

## Migration Guide

### Old Import Pattern (Deprecated)
```typescript
import { admissionService } from '../../services/admissionService';
// Usage
const data = await admissionService.getAdmissionDashboard(filters);
```

### New Import Pattern (Recommended)
```typescript
import { getAdmissionDashboard } from '../../services/admission';
// Usage
const data = await getAdmissionDashboard(filters);
```

### Alternative: Import from Main Services Index
```typescript
import { getAdmissionDashboard, getPrisoners } from '../../services';
```

### Backward Compatibility
The old `admissionService.ts` file has been kept for backward compatibility and now re-exports from the new structure. However, it is marked as deprecated and should be migrated to the new import pattern.

## Updated Components
The following components have been updated to use the new import structure:

1. **AdmissionDashboard.tsx** - Uses `getAdmissionDashboard`

## Benefits

### 1. **Better Organization**
- Each API resource has its own dedicated file
- Dashboard and prisoner operations are clearly separated
- Easier to locate and maintain specific functionality

### 2. **Improved Maintainability**
- Smaller, focused files are easier to understand
- Changes to one resource don't affect others
- Reduced merge conflicts in team environments

### 3. **Enhanced Scalability**
- Easy to add new admission-related services
- Can add resource-specific utilities or helpers
- Better support for code splitting and lazy loading

### 4. **Consistency**
- Follows the same pattern as `system_administration` services
- Standardized service structure across the application
- Predictable import paths

## Future Improvements

1. **Remove Deprecated File**: After all code is migrated, remove `admissionService.ts`
2. **Add Service Tests**: Create unit tests for each service file
3. **Add More Operations**: Extend prisoner service with create, update, delete operations
4. **Add Request Caching**: Implement caching strategies per service
5. **Add Error Handling**: Standardize error handling across services

## Notes

- All existing functionality remains unchanged
- API endpoints and request/response formats are identical
- Type definitions remain in `models/admission`
- All services use the shared `axiosInstance` for HTTP requests
- The default `admissionService` export is maintained for backward compatibility
