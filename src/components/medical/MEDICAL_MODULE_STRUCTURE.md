# Medical Module Folder Structure

## Overview
The Medical Records Management module has been reorganized into a modular, menu-aligned folder structure for improved maintainability, scalability, and developer experience.

## Component Structure

```
src/components/medical/
├── MedicalOverview.tsx                          # Main dashboard
│
├── medicalInformation/                          # Menu: Medical Information
│   ├── MedicalDetails.tsx                       # Tab container
│   ├── medicalRecord/
│   │   ├── MedicalRecordScreen.tsx
│   │   ├── MedicalRecordForm.tsx
│   │   └── MedicalRecordList.tsx
│   ├── bmi/
│   │   ├── BMIScreen.tsx
│   │   ├── BMIForm.tsx
│   │   └── BMIList.tsx
│   ├── caseBook/
│   │   ├── CaseBookScreen.tsx
│   │   ├── CaseBookForm.tsx
│   │   └── CaseBookList.tsx
│   ├── schedules/
│   │   ├── ScheduleScreen.tsx
│   │   ├── ScheduleForm.tsx
│   │   └── ScheduleList.tsx
│   ├── labTests/
│   │   ├── LabTestScreen.tsx
│   │   ├── LabTestForm.tsx
│   │   └── LabTestList.tsx
│   ├── treatment/                               # Treatment Plans
│   │   ├── TreatmentPlanList.tsx
│   │   ├── TreatmentPlanList_GROUPED.tsx
│   │   ├── TreatmentPlanForm.tsx                # ⚠️ Deprecated
│   │   ├── TreatmentPlanFormV2.tsx              # ✅ Active version
│   │   ├── TreatmentPlan.types.ts               # Type definitions
│   │   ├── TreatmentPlan.mock.ts                # Mock data
│   │   └── TreatmentVisualization.tsx
│   ├── examinationResults/
│   │   ├── ExamResultScreen.tsx
│   │   ├── ExamResultForm.tsx
│   │   └── ExamResultList.tsx
│   ├── ailments/
│   │   ├── AilmentScreen.tsx
│   │   ├── AilmentForm.tsx
│   │   └── AilmentList.tsx
│   └── diagnosis/
│       ├── DiagnosisScreen.tsx
│       ├── DiagnosisForm.tsx
│       └── DiagnosisList.tsx
│
├── restrictionAndDietary/                       # Menu: Restriction and Dietary
│   ├── RestrictionAndDietaryDetails.tsx         # Tab container
│   ├── restrictions/
│   │   ├── PrisonerRestrictionForm.tsx
│   │   └── PrisonerRestrictionList.tsx
│   └── dietary/
│       ├── DietaryRequirementForm.tsx
│       └── DietaryRequirementList.tsx
│
├── stationsAndAssessment/                       # Menu: Stations and Assessment
│   ├── StationsAndAssessmentDetails.tsx         # Tab container
│   ├── stationState/
│   │   ├── StationStateForm.tsx
│   │   └── StationStateList.tsx
│   └── foodAssessment/
│       ├── FoodAssessmentForm.tsx
│       └── FoodAssessmentList.tsx
│
├── recommendations/                              # Menu: Recommendations
│   ├── RecommendationsDetails.tsx               # Tab container
│   ├── wardRecommendations/
│   │   ├── WardRecommendationForm.tsx
│   │   └── WardRecommendationList.tsx
│   ├── transferRecommendations/
│   │   ├── TransferRecommendationForm.tsx
│   │   └── TransferRecommendationList.tsx
│   └── releaseRecommendations/
│       ├── ReleaseRecommendationForm.tsx
│       └── ReleaseRecommendationList.tsx
│
└── deathDetails/                                 # Menu: Death Details
    ├── DeathDetails.tsx                          # Tab container
    ├── deathConfirmation/
    │   ├── DeathConfirmationForm.tsx
    │   └── DeathConfirmationList.tsx
    ├── deathNotification/
    │   ├── DeathNotificationForm.tsx
    │   ├── DeathNotificationList.tsx
    │   └── DeathNotificationView.tsx
    └── deathRecipient/
        ├── DeathRecipientForm.tsx
        └── DeathRecipientList.tsx
```

## Services Structure

```
src/services/medical/
├── index.ts                                      # Main barrel exports
├── medicalGetApis.ts                               # API endpoint definitions
├── medical.ts                                   # Core medical service
│
├── medicalInformation/
│   └── index.ts                                 # Ready for individual services
│
├── restrictionAndDietary/
│   └── index.ts                                 # Ready for individual services
│
├── stationsAndAssessment/
│   └── index.ts                                 # Ready for individual services
│
├── recommendations/
│   └── index.ts                                 # Ready for individual services
│
└── deathDetails/
    └── index.ts                                 # Ready for individual services
```

## Import Examples

### Components
```typescript
// Before
import BMIForm from '../components/medical/BMIForm';
import RecommendationsDetails from '../components/medical/RecommendationsDetails';

// After
import BMIForm from '../components/medical/medicalInformation/bmi/BMIForm';
import RecommendationsDetails from '../components/medical/recommendations/RecommendationsDetails';
```

### Services (Future)
```typescript
// When services are created
import { bmiService } from '@/services/medical/medicalInformation';
import { wardRecommendationService } from '@/services/medical/recommendations';
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

Routes updated in `src/routes/medical.routes.tsx`:

```typescript
{
  path: '/medical-records/overview',
  element: <MedicalOverview />,
},
{
  path: '/medical-records/information',
  element: <MedicalDetails />,
},
{
  path: '/medical-records/restriction-dietary',
  element: <RestrictionAndDietaryDetails />,
},
{
  path: '/medical-records/stations-assessment',
  element: <StationsAndAssessmentDetails />,
},
{
  path: '/medical-records/recommendations',
  element: <RecommendationsDetails />,
},
{
  path: '/medical-records/death-details',
  element: <DeathDetails />,
}
```

## Migration Completed

**Files Moved**: 48 component files  
**Folders Created**: 19 component subfolders, 5 service subfolders  
**Routes Updated**: 6 import paths  
**Git History**: Preserved with `git mv`  

## Recent Updates

### February 8, 2026 - Treatment Plan Improvements
- ✅ Renamed `medication_type` → `medication_form` for medical accuracy
- ✅ Added hierarchical dispensing system (`quantity_dispensed` + `dispensing_unit`)
- ✅ Implemented context-aware dispensing unit dropdowns
- ✅ Added 'Cream' to medication forms
- ✅ Updated TreatmentPlanFormV2.tsx with new field structure
- ✅ Deprecated TreatmentPlanForm.tsx (old version)
- 📄 See [TREATMENT_PLAN_IMPROVEMENTS.md](../../../ma_ignore/TREATMENT_PLAN_IMPROVEMENTS.md) for details

## Next Steps

1. Create individual service files as needed in service subfolders
2. Update barrel exports in service index.ts files
3. Add shared/common medical components folder if needed
4. Create corresponding test folders mirroring structure
5. Update any remaining imports in other modules
6. ⚠️ **Backend API**: Update treatment plan endpoints to support new field names

---

*Generated: February 4, 2026*  
*Commit: 9d6c64a*
