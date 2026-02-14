/**
 * API Client untuk SIKP Backend
 *
 * Gunakan modul ini untuk melakukan API calls ke Backend SIKP.
 * Authentication menggunakan OAuth 2.0 + PKCE tokens dari SSO UNSRI.
 *
 * Token OAuth secara otomatis diinject ke header Authorization.
 */

import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import {
  getSsoAccessToken as getStoredToken,
  refreshSsoAccessToken,
} from "./sso-client";

// Backend SIKP Base URL
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_SIKP_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8789";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log("Token expired, attempting refresh...");
        await refreshSsoAccessToken();
        // Retry with new token
        const token = getStoredToken();
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Standard API Response format
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;
}

/**
 * Error response with validation errors
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  data: {
    errors?: Array<{
      path: string[];
      message: string;
    }>;
  } | null;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Main API client function
 *
 * @param endpoint - API endpoint (e.g., '/api/teams')
 * @param options - Axios request config
 * @returns Promise with typed response
 *
 * @example
 * // GET request
 * const { data } = await apiClient<Team[]>('/api/teams/my-teams');
 *
 * @example
 * // POST request with JSON
 * const { data } = await apiClient<Team>('/api/teams', {
 *   method: 'POST',
 *   data: { name: 'Tim KP ABC' },
 * });
 *
 * @example
 * // POST request with FormData
 * const formData = new FormData();
 * formData.append('file', file);
 * const { data } = await apiClient<Document>('/api/submissions/123/documents', {
 *   method: 'POST',
 *   data: formData,
 * });
 */
export async function apiClient<T>(
  endpoint: string,
  options: AxiosRequestConfig = {},
): Promise<ApiResponse<T>> {
  try {
    // Detect if body is FormData
    const isFormData = options.data instanceof FormData;

    // Build config
    const config: AxiosRequestConfig = {
      url: endpoint,
      method: options.method || "GET",
      ...options,
    };

    // Don't set Content-Type for FormData - axios will handle it
    if (isFormData) {
      config.headers = {
        ...config.headers,
        "Content-Type": undefined,
      };
    }

    const response = await axiosInstance.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<T>>;

      // Handle response error
      if (axiosError.response) {
        const data = axiosError.response.data;
        return {
          success: false,
          message: data?.message || `Error: ${axiosError.response.status}`,
          data: null,
        };
      }

      // Handle network error
      return {
        success: false,
        message: axiosError.message || "Network error",
        data: null,
      };
    }

    console.error("API Client Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

/**
 * Upload file to API
 *
 * @param endpoint - API endpoint for file upload
 * @param formData - FormData containing file and other fields
 * @returns Promise with typed response
 *
 * @example
 * const formData = new FormData();
 * formData.append('file', file);
 * formData.append('documentType', 'KTP');
 * const { data } = await uploadFile('/api/submissions/xyz/documents', formData);
 */
export async function uploadFile<T>(
  endpoint: string,
  formData: FormData,
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.post<ApiResponse<T>>(
      endpoint,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<T>>;
      if (axiosError.response) {
        return {
          success: false,
          message:
            axiosError.response.data?.message ||
            `Error: ${axiosError.response.status}`,
          data: null,
        };
      }
    }
    console.error("Upload Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Upload failed",
      data: null,
    };
  }
}

/**
 * GET request helper
 */
export function get<T>(endpoint: string, params?: Record<string, string>) {
  return apiClient<T>(endpoint, { method: "GET", params });
}

/**
 * POST request helper
 */
export function post<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "POST",
    data: body,
  });
}

/**
 * PUT request helper
 */
export function put<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PUT",
    data: body,
  });
}

/**
 * PATCH request helper
 */
export function patch<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    data: body,
  });
}

/**
 * DELETE request helper
 */
export function del<T>(endpoint: string) {
  return apiClient<T>(endpoint, { method: "DELETE" });
}

// Export base URL and axios instance for reference
export { API_BASE_URL, axiosInstance };
