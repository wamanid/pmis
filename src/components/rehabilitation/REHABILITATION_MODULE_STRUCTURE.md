# Rehabilitation Module Folder Structure

## Overview
The Rehabilitation Management module has been reorganized into a modular, menu-aligned folder structure for improved maintainability, scalability, and developer experience.

## Component Structure

```
src/components/rehabilitation/
├── RehabilitationDetailView.tsx                 # Main overview/dashboard
│
├── enrollments/                                 # Menu: Rehabilitation Enrollments
│   ├── EnrollmentsScreen.tsx                    # Tab container for enrollments
│   ├── EnrollmentDetailView.tsx                 # Detail view component
│   ├── EnrollmentAssessmentScreen.tsx           # Assessment container
│   ├── EnrollmentAssessmentForm.tsx             # Assessment form
│   ├── EnrollmentAssessmentList.tsx             # Assessment list
│   ├── enrollment/                              # Enrollment management
│   │   ├── RehabilitationEnrollmentScreen.tsx
│   │   ├── RehabilitationEnrollmentForm.tsx
│   │   └── RehabilitationEnrollmentList.tsx
│   └── sessions/                                # Session tracking
│       ├── RehabilitationEnrollmentSessionScreen.tsx
│       ├── RehabilitationEnrollmentSessionForm.tsx
│       └── RehabilitationEnrollmentSessionList.tsx
│
├── afterCare/                                   # Menu: After Care
│   ├── AfterCareScreen.tsx
│   ├── AfterCareForm.tsx
│   └── AfterCareList.tsx
│
├── prisonerChildren/                            # Menu: Prisoner Children
│   ├── PrisonerChildrenForm.tsx
│   └── PrisonerChildrenList.tsx
│
├── prisonerDependents/                          # Menu: Prisoner Dependents
│   ├── PrisonerDependentsForm.tsx
│   └── PrisonerDependentsList.tsx
│
└── welfare/                                     # Menu: Welfare
    ├── WelfareForm.tsx
    └── WelfareList.tsx
```

## Services Structure

```
src/services/rehabilitation/
├── index.ts                                     # Main barrel exports
│
├── enrollments/
│   └── index.ts                                 # Ready for enrollment services
│
├── afterCare/
│   └── index.ts                                 # Ready for after care services
│
├── prisonerChildren/
│   └── index.ts                                 # Ready for prisoner children services
│
├── prisonerDependents/
│   └── index.ts                                 # Ready for prisoner dependents services
│
└── welfare/
    └── index.ts                                 # Ready for welfare services
```

## Import Examples

### Components
```typescript
// Before
import EnrollmentsScreen from '../components/rehabilitation/EnrollmentsScreen';
import AfterCareForm from '../components/rehabilitation/AfterCareForm';

// After
import EnrollmentsScreen from '../components/rehabilitation/enrollments/EnrollmentsScreen';
import AfterCareForm from '../components/rehabilitation/afterCare/AfterCareForm';
```

### Services (Future)
```typescript
// When services are created
import { enrollmentService } from '@/services/rehabilitation/enrollments';
import { afterCareService } from '@/services/rehabilitation/afterCare';
```

## Design Principles

### 1. Menu-Aligned Structure
- Each menu item = subfolder
- Mirrors UI navigation exactly
- Intuitive file discovery

### 2. Feature Cohesion
- Related components grouped together
- Clear boundaries between features
- Easy to test and maintain

### 3. Consistent Patterns
- **Screen.tsx**: Main container with tabs/sections
- **Form.tsx**: Create/Edit forms
- **List.tsx**: Data tables/lists

### 4. Scalability
- Add new tabs: Create subfolder under parent
- Add new menu items: Create top-level subfolder
- No major refactoring needed

### 5. Parallel Organization
- Services mirror component structure
- Easy to locate related code
- Consistent import paths

## Benefits

✅ **Improved Navigation**: Follow UI menu to find code  
✅ **Reduced Conflicts**: Team members work in separate modules  
✅ **Easy Onboarding**: Clear structure for new developers  
✅ **Better Maintenance**: Changes isolated to specific modules  
✅ **Future-Proof**: Supports growth without restructuring  

## Routes Configuration

Routes updated in `src/routes/rehabilitation.routes.tsx`:

```typescript
{
  path: '/rehabilitation/overview',
  element: <RehabilitationDetailView />,
},
{
  path: '/rehabilitation/enrollments',
  element: <EnrollmentsScreen />,
},
{
  path: '/rehabilitation/assessments',
  element: <EnrollmentAssessmentScreen />,
},
{
  path: '/rehabilitation/after-care',
  element: <AfterCareScreen />,
}
```

## Migration Completed

**Files Organized**: 21 component files  
**Folders Created**: 7 component subfolders, 5 service subfolders  
**Routes Created**: 1 routes file with 4 routes  
**Git History**: Preserved with `git mv` for original 10 files  
**Additional Files**: 11 new component files added to existing structure  

## File Mapping

### Enrollments Module
| Original Location | New Location |
|------------------|--------------|
| `EnrollmentsScreen.tsx` | `enrollments/EnrollmentsScreen.tsx` |
| `RehabilitationEnrollmentScreen.tsx` | `enrollments/enrollment/RehabilitationEnrollmentScreen.tsx` |
| `RehabilitationEnrollmentForm.tsx` | `enrollments/enrollment/RehabilitationEnrollmentForm.tsx` |
| `RehabilitationEnrollmentList.tsx` | `enrollments/enrollment/RehabilitationEnrollmentList.tsx` |
| `RehabilitationEnrollmentSessionScreen.tsx` | `enrollments/sessions/RehabilitationEnrollmentSessionScreen.tsx` |
| `RehabilitationEnrollmentSessionForm.tsx` | `enrollments/sessions/RehabilitationEnrollmentSessionForm.tsx` |
| `RehabilitationEnrollmentSessionList.tsx` | `enrollments/sessions/RehabilitationEnrollmentSessionList.tsx` |

### After Care Module
| Original Location | New Location |
|------------------|--------------|
| `AfterCareScreen.tsx` | `afterCare/AfterCareScreen.tsx` |
| `AfterCareForm.tsx` | `afterCare/AfterCareForm.tsx` |
| `AfterCareList.tsx` | `afterCare/AfterCareList.tsx` |

### Additional Modules (New Files)
| Module | Files | Location |
|--------|-------|----------|
| **Enrollment Assessments** | 3 files | `enrollments/EnrollmentAssessment*.tsx` |
| **Prisoner Children** | 2 files | `prisonerChildren/PrisonerChildren*.tsx` |
| **Prisoner Dependents** | 2 files | `prisonerDependents/PrisonerDependents*.tsx` |
| **Welfare** | 2 files | `welfare/Welfare*.tsx` |
| **Detail Views** | 2 files | Root and enrollments folders |

## Import Path Corrections

All import paths have been systematically corrected based on file depth:

### Container Files (1 level deep)
- **Location**: `enrollments/EnrollmentsScreen.tsx`
- **UI imports**: `../../ui/component`
- **Subfolder imports**: `./enrollment/Component`, `./sessions/Component`

### Enrollment Files (2 levels deep)
- **Location**: `enrollments/enrollment/*.tsx`
- **UI imports**: `../../../ui/component`

### Session Files (2 levels deep)
- **Location**: `enrollments/sessions/*.tsx`
- **UI imports**: `../../../ui/component`

### After Care Files (1 level deep)
- **Location**: `afterCare/*.tsx`
- **UI imports**: `../../../ui/component`

### Enrollment Assessment Files (2 levels deep)
- **Location**: `enrollments/EnrollmentAssessment*.tsx`
- **UI imports**: `../../../ui/component`

### Prisoner Children Files (1 level deep)
- **Location**: `prisonerChildren/*.tsx`
- **UI imports**: `../../../ui/component`

### Prisoner Dependents Files (1 level deep)
- **Location**: `prisonerDependents/*.tsx`
- **UI imports**: `../../../ui/component`

### Welfare Files (1 level deep)
- **Location**: `welfare/*.tsx`
- **UI imports**: `../../../ui/component`

### Root Level Files
- **Location**: `RehabilitationDetailView.tsx`
- **UI imports**: `../../ui/component`

## Next Steps

1. Create individual service files as needed in service subfolders
2. Update barrel exports in service index.ts files
3. Add shared/common rehabilitation components folder if needed
4. Create corresponding test folders mirroring structure
5. Update any remaining imports in other modules
6. Consider creating a RehabilitationOverview.tsx dashboard component

## Module Organization

The rehabilitation module follows a two-tier structure:

**Tier 1: Main Menu Items**
- Overview/Dashboard
- Enrollments (with sub-features)
- After Care
- Prisoner Children
- Prisoner Dependents
- Welfare

**Tier 2: Sub-Features (under Enrollments)**
- Enrollment management
- Session tracking
- Enrollment assessments

This structure allows for easy expansion as new rehabilitation features are added.

---

*Generated: February 26, 2026*  
*Updated: March 3, 2026 (Added new submodules)*  
*Pattern: Based on Medical Module Refactoring (commit 9d6c64a)*
