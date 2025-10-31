// API Configuration
// Centralized API URL configuration for all services

// Get the base API URL based on environment
export const getApiBaseUrl = (): string => {
  // Check if VITE_API_URL is explicitly set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development: use proxy to localhost:3001
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  
  // Production fallback: relative path to deployed API
  return '/api';
};

// Get the base server URL (for image URLs, etc.)
export const getServerBaseUrl = (): string => {
  // Check if VITE_API_URL is set, remove /api suffix if present
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  
  // Development: use localhost:3001
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // Production: use current origin
  return typeof window !== 'undefined' ? window.location.origin : '';
};

// Export configured URLs
export const API_BASE_URL = getApiBaseUrl();
export const SERVER_BASE_URL = getServerBaseUrl();