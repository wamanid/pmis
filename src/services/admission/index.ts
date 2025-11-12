/**
 * Admission Services
 * Centralized export for all admission API services
 */

// Dashboard Service
export { getAdmissionDashboard } from './dashboardService';

// Prisoner Service
export { getPrisoners, getPrisonerById } from './prisonerService';

// Default export for backward compatibility
export const admissionService = {
  getAdmissionDashboard: async (...args: Parameters<typeof import('./dashboardService').getAdmissionDashboard>) => 
    (await import('./dashboardService')).getAdmissionDashboard(...args),
  getPrisoners: async (...args: Parameters<typeof import('./prisonerService').getPrisoners>) => 
    (await import('./prisonerService')).getPrisoners(...args),
  getPrisonerById: async (...args: Parameters<typeof import('./prisonerService').getPrisonerById>) => 
    (await import('./prisonerService')).getPrisonerById(...args),
};

export default admissionService;
