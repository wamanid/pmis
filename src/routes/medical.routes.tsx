import { RouteObject } from 'react-router-dom';
import RecommendationsDetails from '../components/medical/RecommendationsDetails';
import StationsAndAssessmentDetails from '../components/medical/stationsAndAssessmentDetails';

/**
 * Medical Management Routes
 * Handles prisoner admission, approvals, and admission-related functionality
 */
export const medicalRoutes: RouteObject[] = [
  {
    path: '/medical-records/recommendations',
    element: <RecommendationsDetails />,
  },
  {
    path: '/medical-records/stations-assessment',
    element: <StationsAndAssessmentDetails />,
  },


];
