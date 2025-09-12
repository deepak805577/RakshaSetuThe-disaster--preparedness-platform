import axios from 'axios';
import { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from '../types';

// Use current domain for API calls, fallback to localhost for development
const getApiUrl = () => {
  // For production builds, always use the current domain
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For development, check if we have an explicit API URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

// Debug: Log the API URL being used
console.log('🔧 API_URL configured as:', API_URL);
console.log('🌎 NODE_ENV:', process.env.NODE_ENV);
console.log('🌐 Full API Base URL will be:', `${API_URL}/api`);
if (typeof window !== 'undefined') {
  console.log('🌍 window.location.origin:', window.location.origin);
}

// Create axios instance with mobile-friendly settings
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout for mobile networks
  validateStatus: (status) => status >= 200 && status < 500, // Don't throw on 4xx errors
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class AuthService {
  private authToken: string | null = null;

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Enhanced mobile debugging
      console.log('🔍 AuthService: Attempting login with:', { email: credentials.email });
      console.log('🌐 API Base URL:', api.defaults.baseURL);
      console.log('🔧 Full URL will be:', `${api.defaults.baseURL}/auth/login`);
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('🌍 Current URL:', window.location.href);
      
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ AuthService: Login response:', response.status, response.data);
      }
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Login failed');
      }

      return response.data.data;
    } catch (error: any) {
      // Enhanced error logging for mobile debugging
      console.error('❌ AuthService: Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        network: {
          online: navigator.onLine,
          connection: (navigator as any).connection,
        },
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      });
      
      // Handle specific mobile network issues
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Connection timeout. Please check your internet connection and try again.');
      }
      
      if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      if (error.response?.status === 0) {
        throw new Error('Unable to connect to server. Please try again.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Registration failed');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch profile');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<ApiResponse<User>>('/auth/profile', userData);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error('Failed to update profile');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout on client side even if server request fails
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}

export const authService = new AuthService();
