import axios from 'axios';

// Determine API base URL based on environment
const getBaseURL = () => {
  // In production (Vercel), use the same domain for API calls
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  // In development, use environment variable or empty string (Vite proxy)
  return import.meta.env.VITE_API_URL || '';
};

// Configure axios defaults
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

