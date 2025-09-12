import axios from 'axios';
import { DisasterModule, ApiResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class ModuleService {
  async getAllModules(): Promise<DisasterModule[]> {
    try {
      const response = await api.get<ApiResponse<DisasterModule[]>>('/modules');
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch modules');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch modules');
    }
  }

  async getModuleById(id: string): Promise<DisasterModule> {
    try {
      const response = await api.get<ApiResponse<DisasterModule>>(`/modules/${id}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch module');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch module');
    }
  }

  async getModulesByType(type: string): Promise<DisasterModule[]> {
    try {
      const response = await api.get<ApiResponse<DisasterModule[]>>(`/modules?type=${type}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch modules');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch modules');
    }
  }

  async getModulesByDifficulty(difficulty: string): Promise<DisasterModule[]> {
    try {
      const response = await api.get<ApiResponse<DisasterModule[]>>(`/modules?difficulty=${difficulty}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch modules');
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to fetch modules');
    }
  }
}

export const moduleService = new ModuleService();
