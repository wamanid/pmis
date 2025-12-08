/**
 * Admission Services
 * Centralized export for all admission API services
 */

// Dashboard Service (moved to parent directory as admissionService)
export { getAdmissionDashboard } from '../admissionService';

// Prisoner Service
export {
  getPrisoners,
  getPrisonerById,
  generatePrisonerNumber,
} from './prisonerService';

// Prisoner Biodata Service (moved to parent directory)
export {
  getPrisonerBiodata,
  getPrisonerBiodataByPrisonerId,
} from '../prisonerBiodataService';

// Default export for backward compatibility
export const admissionService = {
  getAdmissionDashboard: async (...args: Parameters<typeof import('../admissionService').getAdmissionDashboard>) => 
    (await import('../admissionService')).getAdmissionDashboard(...args),
  getPrisoners: async (...args: Parameters<typeof import('./prisonerService').getPrisoners>) => 
    (await import('./prisonerService')).getPrisoners(...args),
  getPrisonerById: async (...args: Parameters<typeof import('./prisonerService').getPrisonerById>) => 
    (await import('./prisonerService')).getPrisonerById(...args),
  generatePrisonerNumber: async (...args: Parameters<typeof import('./prisonerService').generatePrisonerNumber>) => 
    (await import('./prisonerService')).generatePrisonerNumber(...args),
  getPrisonerBiodata: async (...args: Parameters<typeof import('../prisonerBiodataService').getPrisonerBiodata>) =>
    (await import('../prisonerBiodataService')).getPrisonerBiodata(...args),
  getPrisonerBiodataByPrisonerId: async (
    ...args: Parameters<typeof import('../prisonerBiodataService').getPrisonerBiodataByPrisonerId>
  ) => (await import('../prisonerBiodataService')).getPrisonerBiodataByPrisonerId(...args),
};

export default admissionService;
