import axios from 'axios';
import { toast } from 'sonner';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pmis.angstrom-technologies.ug/api';

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
    // Add auth token if it exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add location filters to query parameters
    const filterStorage = localStorage.getItem('pmis_user_filters');
    if (filterStorage) {
      try {
        const filters = JSON.parse(filterStorage);
        
        // Initialize params if not exists
        if (!config.params) {
          config.params = {};
        }
        
        // Add filter params if they exist and aren't already in the request
        if (filters.region && !config.params.region) {
          config.params.region = filters.region;
        }
        if (filters.district && !config.params.district) {
          config.params.district = filters.district;
        }
        if (filters.station && !config.params.station) {
          config.params.station = filters.station;
        }
      } catch (error) {
        console.error('Failed to parse filter storage:', error);
      }
    }
    
    // Log request for debugging (remove in production)
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      params: config.params,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response for debugging (remove in production)
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    
    // Handle cases where backend returns 200 but with success: false
    if (response.data && response.data.success === false) {
      console.warn('API returned success: false', response.data);
    }
    
    return response;
  },
  (error) => {
    // Handle different error scenarios
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
          // You might want to redirect to login page here
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
      
      console.error('API Error Response:', {
        status,
        url: error.config?.url,
        data,
      });
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Network error. Please check your connection.');
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;