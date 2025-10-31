import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = 'https://pmis.angstrom-technologies.ug/api';

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
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data?.message || 'Bad request. Please check your input.');
          break;
        case 401:
          toast.error('Unauthorized. Please login again.');
          try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          } catch (e) { /* ignore storage errors */ }
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
      
      if (process.env.NODE_ENV !== 'production') {
        // console.error('API Error Response:', { status, url: error.config?.url });
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
      if (process.env.NODE_ENV !== 'production') {
        // console.error('Network Error:', error.request);
      }
    } else {
      toast.error('An unexpected error occurred.');
      if (process.env.NODE_ENV !== 'production') {
        // console.error('Error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
