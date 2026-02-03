import { RouteObject } from 'react-router-dom';
import MedicalOverview from '../components/medical/MedicalOverview';
import MedicalDetails from '../components/medical/MedicalDetails';
import RestrictionAndDietaryDetails from '../components/medical/restrictionAndDietaryDetails';
import StationsAndAssessmentDetails from '../components/medical/stationsAndAssessmentDetails';
import RecommendationsDetails from '../components/medical/RecommendationsDetails';
import DeathDetails from '../components/medical/DeathDetails';

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
];
