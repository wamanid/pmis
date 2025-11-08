/**
 * Services Index
 * Central export point for all service modules
 */

// Authentication Service
export * from './authService';

// Admission Services
export * from './admission';

// Menu Service
export * from './menuService';

// System Administration Services
export * from './system_administration';

// Axios Instance (for custom configurations if needed)
export { default as axiosInstance } from './axiosInstance';
