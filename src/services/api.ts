/**
 * API Service Layer
 * 
 * This service provides a centralized API client for the Union Bank Data Analytics Portal.
 * It supports both demo mode (localStorage-based) and real API mode.
 * 
 * Configuration:
 * - Set VITE_API_URL environment variable to your PHP backend URL
 * - If not set, the app runs in demo mode using localStorage
 */

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || '';
const IS_DEMO_MODE = !API_URL;

// Types
export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: Record<string, unknown>[];
  filename?: string;
  rowCount?: number;
  error?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `API Error: ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }

  return response.json();
}

// Authentication API
export const authApi = {
  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    if (IS_DEMO_MODE) {
      // Demo mode: validate against hardcoded credentials
      const validUsers: Record<string, { password: string; role: 'admin' | 'user' }> = {
        admin: { password: 'admin123', role: 'admin' },
        user: { password: 'user123', role: 'user' },
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      const user = validUsers[credentials.username];
      if (user && user.password === credentials.password) {
        const userData: User = {
          id: crypto.randomUUID(),
          username: credentials.username,
          role: user.role,
        };
        return { success: true, user: userData, token: 'demo-token' };
      }
      return { success: false, error: 'Invalid username or password' };
    }

    return apiRequest<LoginResponse>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Logout current user
   */
  async logout(): Promise<{ success: boolean }> {
    if (IS_DEMO_MODE) {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      return { success: true };
    }

    return apiRequest('/auth/logout.php', { method: 'POST' });
  },

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<User | null> {
    if (IS_DEMO_MODE) {
      const stored = localStorage.getItem('auth_user');
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const response = await apiRequest<{ user: User }>('/auth/session.php');
      return response.user;
    } catch {
      return null;
    }
  },
};

// Data Upload API
export const dataApi = {
  /**
   * Upload Excel file for processing
   */
  async uploadExcel(file: File): Promise<UploadResponse> {
    if (IS_DEMO_MODE) {
      // Demo mode: process file client-side using xlsx library
      return { 
        success: true, 
        filename: file.name,
        rowCount: 0,
        data: [],
      };
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/upload/process.php`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw { message: 'Upload failed', status: response.status };
    }

    return response.json();
  },

  /**
   * Get uploaded data
   */
  async getData(): Promise<Record<string, unknown>[]> {
    if (IS_DEMO_MODE) {
      const stored = localStorage.getItem('excel_data');
      return stored ? JSON.parse(stored) : [];
    }

    const response = await apiRequest<{ data: Record<string, unknown>[] }>('/data/get.php');
    return response.data;
  },

  /**
   * Clear uploaded data
   */
  async clearData(): Promise<{ success: boolean }> {
    if (IS_DEMO_MODE) {
      localStorage.removeItem('excel_data');
      return { success: true };
    }

    return apiRequest('/data/clear.php', { method: 'DELETE' });
  },
};

// Export API status helper
export const getApiStatus = () => ({
  isDemoMode: IS_DEMO_MODE,
  apiUrl: API_URL,
  isConfigured: !!API_URL,
});

export default {
  auth: authApi,
  data: dataApi,
  getStatus: getApiStatus,
};
