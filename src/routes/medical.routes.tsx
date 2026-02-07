import { RouteObject } from 'react-router-dom';
import MedicalOverview from '../components/medical/MedicalOverview';
import MedicalDetails from '../components/medical/medicalInformation/MedicalDetails';
import RestrictionAndDietaryDetails from '../components/medical/restrictionAndDietary/RestrictionAndDietaryDetails';
import StationsAndAssessmentDetails from '../components/medical/stationsAndAssessment/StationsAndAssessmentDetails';
import RecommendationsDetails from '../components/medical/recommendations/RecommendationsDetails';
import DeathDetails from '../components/medical/deathDetails/DeathDetails';
import TreatmentPlanDemo from '../components/medical/treatment/TreatmentPlanDemo';

/**
 * Medical Management Routes
 * Handles medical records, recommendations, restrictions, and death records
 */
export const medicalRoutes: RouteObject[] = [
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
  },
  {
    path: '/medical-records/treatment-plan-demo',
    element: <TreatmentPlanDemo />,
  },
];
