/**
 * API Configuration
 * Centralized configuration for all API calls
 * Note: Vite uses import.meta.env.VITE_* (not process.env.REACT_APP_*)
 */

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://inlaks-t24-backend.vercel.app',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 120000, // 2 minutes for bulk uploads
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
