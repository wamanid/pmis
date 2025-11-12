import axios from 'axios';
import { toast } from 'sonner';

// Get API base URL from environment variable and ensure trailing slash
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pmis.angstrom-technologies.ug/api';
if (!API_BASE_URL.endsWith('/')) API_BASE_URL = API_BASE_URL + '/';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if it exists (safe read)
    try {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // storage unavailable or access denied — continue without token
    }


    // --- 2. Inject location filters if present
    try {
      const filterStorage = localStorage.getItem('pmis_user_filters');
      if (filterStorage) {
        const filters = JSON.parse(filterStorage);

        // Ensure params object exists
        config.params = config.params || {};

        // Only add filters that exist and aren't already set
        if (filters.region && !config.params.region) {
          config.params.region = filters.region;
        }
        if (filters.district && !config.params.district) {
          config.params.district = filters.district;
        }
        if (filters.station && !config.params.station) {
          config.params.station = filters.station;
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to parse user filters:', err);
      }
    }
    
    // Do not log request bodies or headers in production or with tokens.
    if (process.env.NODE_ENV !== 'production') {
      // Minimal, non-sensitive debug info
      // console.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    // Do not print full error objects that may contain sensitive data
    if (process.env.NODE_ENV !== 'production') {
      // console.error('Request Error:', error?.message || error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== 'production') {
      // console.debug(`API Response: ${response.status} ${response.config?.url}`);
    }
    
    // Handle cases where backend returns 200 but with success: false
    if (response.data && response.data.success === false) {
      console.warn('API returned success: false', response.data);
    }
    
    return response;
  },
  (error) => {
    // If caller asked to skip axios toast (e.g. form will handle showing a message),
    // we look for a custom header or config flag.
    const skipToast =
      Boolean(error?.config?.headers?.['x-skip-toast']) ||
      Boolean(error?.config?.skipErrorToast);

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data?.message || 'Bad request. Please check your input.');
          break;
        case 401:
          toast.error('Unauthorized. Please login again.');
          // Clear token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('pmis_user_filters');
          // Redirect to login page
          window.location.href = '/login';
          break;
        case 403:
          toast.error('Access forbidden. You do not have permission.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      if (!skipToast) toast.error('Network error. Please check your connection.');
      if (process.env.NODE_ENV !== 'production') {
        // console.error('Network Error:', error.request);
      }
    } else {
      if (!skipToast) toast.error('An unexpected error occurred.');
      if (process.env.NODE_ENV !== 'production') {
        // console.error('Error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;