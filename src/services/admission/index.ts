/**
 * Admission Services
 * Centralized export for all admission API services
 */

// Dashboard Service
export { getAdmissionDashboard } from './dashboardService';

// Prisoner Service
export {
  getPrisoners,
  getPrisonerById,
  generatePrisonerNumber,
} from './prisonerService';
export {
  getPrisonerBiodata,
  getPrisonerBiodataByPrisonerId,
} from './prisonerBiodataService';

// Default export for backward compatibility
export const admissionService = {
  getAdmissionDashboard: async (...args: Parameters<typeof import('./dashboardService').getAdmissionDashboard>) => 
    (await import('./dashboardService')).getAdmissionDashboard(...args),
  getPrisoners: async (...args: Parameters<typeof import('./prisonerService').getPrisoners>) => 
    (await import('./prisonerService')).getPrisoners(...args),
  getPrisonerById: async (...args: Parameters<typeof import('./prisonerService').getPrisonerById>) => 
    (await import('./prisonerService')).getPrisonerById(...args),
  generatePrisonerNumber: async (...args: Parameters<typeof import('./prisonerService').generatePrisonerNumber>) => 
    (await import('./prisonerService')).generatePrisonerNumber(...args),
  getPrisonerBiodata: async (...args: Parameters<typeof import('./prisonerBiodataService').getPrisonerBiodata>) =>
    (await import('./prisonerBiodataService')).getPrisonerBiodata(...args),
  getPrisonerBiodataByPrisonerId: async (
    ...args: Parameters<typeof import('./prisonerBiodataService').getPrisonerBiodataByPrisonerId>
  ) => (await import('./prisonerBiodataService')).getPrisonerBiodataByPrisonerId(...args),
};

export default admissionService;
