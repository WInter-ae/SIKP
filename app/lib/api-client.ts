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

// URL untuk pengajuan, teams, templates (URL lama — tetap)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_AUTH_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://backend-sikp.backend-sikp.workers.dev";

// URL untuk pelaksanaan magang: logbook, mentor, internship, penilaian (URL baru)
export const INTERNSHIP_API_BASE_URL =
  import.meta.env.VITE_API_INTERNSHIP_URL ||
  "https://backend-sikp.mukarrobinujiantik.workers.dev";

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
  options: RequestInit & { _baseUrl?: string } = {},
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const { _baseUrl, ...fetchOptions } = options as RequestInit & {
    _baseUrl?: string;
  };
  const effectiveBaseUrl = _baseUrl || API_BASE_URL;
  const isFormData = fetchOptions.body instanceof FormData;

  try {
    const headers = buildHeaders(
      token,
      isFormData,
      fetchOptions.headers as Record<string, string>,
    );

    const response = await fetch(`${effectiveBaseUrl}${endpoint}`, {
      ...fetchOptions,
      credentials: "omit",
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
      // Handle 401 Unauthorized - token invalid/expired.
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=unauthorized";
        }

        return {
          success: false,
          message:
            (data as ApiResponse<T>).message ||
            "Session expired. Silakan login kembali.",
          data: null,
        };
      }

      const errorMessage =
        (data as ApiResponse<T>).message || getErrorMessage(response.status);
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
 * GET request helper (pengajuan/submission URL)
 */
export function get<T>(endpoint: string, params?: Record<string, string>) {
  const url = params
    ? `${endpoint}?${new URLSearchParams(params).toString()}`
    : endpoint;
  return apiClient<T>(url, { method: "GET" });
}

/**
 * POST request helper (pengajuan/submission URL)
 */
export function post<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper (pengajuan/submission URL)
 */
export function put<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper (pengajuan/submission URL)
 */
export function patch<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper (pengajuan/submission URL)
 */
export function del<T>(endpoint: string) {
  return apiClient<T>(endpoint, { method: "DELETE" });
}

// ==================== INTERNSHIP CLIENT HELPERS ====================
// Digunakan untuk: logbook, mentor, internship data, penilaian
// URL: VITE_API_INTERNSHIP_URL (https://backend-sikp.mukarrobinujiantik.workers.dev)

export function iget<T>(endpoint: string, params?: Record<string, string>) {
  const url = params
    ? `${endpoint}?${new URLSearchParams(params).toString()}`
    : endpoint;
  return apiClient<T>(url, { method: "GET", _baseUrl: INTERNSHIP_API_BASE_URL } as RequestInit & { _baseUrl: string });
}

export function ipost<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    _baseUrl: INTERNSHIP_API_BASE_URL,
  } as RequestInit & { _baseUrl: string });
}

export function iput<T>(endpoint: string, body?: unknown) {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    _baseUrl: INTERNSHIP_API_BASE_URL,
  } as RequestInit & { _baseUrl: string });
}

export function idel<T>(endpoint: string) {
  return apiClient<T>(endpoint, {
    method: "DELETE",
    _baseUrl: INTERNSHIP_API_BASE_URL,
  } as RequestInit & { _baseUrl: string });
}

// Export base URLs for reference
export { API_BASE_URL };
