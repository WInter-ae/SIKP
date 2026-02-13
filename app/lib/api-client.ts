/**
 * API Client untuk SIKP Backend
 *
 * Gunakan modul ini untuk melakukan API calls ke backend selain authentication.
 * Authentication menggunakan better-auth yang sudah dikonfigurasi di auth-client.ts
 */

import { getAuthToken as getStoredToken } from "./auth-client";
import {
  parseJsonResponse,
  getErrorMessage,
  isNetworkError,
  logApiError,
  ApiError,
  API_ERROR_MESSAGES,
} from "./api-error";

// Gunakan URL Workers sebagai default; bisa di-override via env
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_AUTH_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-sikp.backend-sikp.workers.dev";

/**
 * Standard API Response format
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
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
 * Get auth token from storage
 * Mengambil token JWT yang disimpan saat login
 */
function getAuthToken(): string | null {
  return getStoredToken();
}

/**
 * Build request headers
 */
function buildHeaders(
  token: string | null,
  isFormData: boolean,
  customHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {};

  // Don't force Content-Type for FormData
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  return headers;
}

/**
 * Main API client function
 *
 * @param endpoint - API endpoint (e.g., '/api/teams')
 * @param options - Fetch options
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
 *   body: JSON.stringify({ name: 'Tim KP ABC' }),
 * });
 *
 * @example
 * // POST request with FormData
 * const formData = new FormData();
 * formData.append('file', file);
 * const { data } = await apiClient<Document>('/api/submissions/123/documents', {
 *   method: 'POST',
 *   body: formData,
 * });
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  try {
    const headers = buildHeaders(
      token,
      isFormData,
      options.headers as Record<string, string>
    );

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      // Use cookies only when same-origin (no explicit base URL)
      credentials: API_BASE_URL ? "omit" : "include",
      headers,
    });

    // Parse response JSON
    let data;
    try {
      data = await parseJsonResponse(response);
    } catch (parseError) {
      if (parseError instanceof ApiError) {
        logApiError(parseError, endpoint);
        return {
          success: false,
          message: parseError.message,
          data: null,
        };
      }
      throw parseError;
    }

    // Handle non-OK responses
    if (!response.ok) {
      const errorMessage = (data as ApiResponse<T>).message || getErrorMessage(response.status);
      return {
        success: false,
        message: errorMessage,
        data: null,
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    // Handle network errors
    if (isNetworkError(error)) {
      console.error("❌ Network Error:", error);
      return {
        success: false,
        message: API_ERROR_MESSAGES.NETWORK_ERROR,
        data: null,
      };
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : API_ERROR_MESSAGES.UNKNOWN_ERROR;
    console.error("❌ API Client Error:", error);
    
    return {
      success: false,
      message: errorMessage,
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
  return apiClient<T>(endpoint, {
    method: "POST",
    body: formData,
  });
}

/**
 * GET request helper
 */
export function get<T>(endpoint: string, params?: Record<string, string>) {
  const url = params
    ? `${endpoint}?${new URLSearchParams(params).toString()}`
    : endpoint;
  return apiClient<T>(url, { method: "GET" });
}

/**
 * POST request helper
 */
export function post<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export function put<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export function patch<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function del<T>(endpoint: string) {
  return apiClient<T>(endpoint, { method: "DELETE" });
}

// Export base URL for reference
export { API_BASE_URL };
