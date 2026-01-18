/**
 * API Client untuk SIKP Backend
 *
 * Gunakan modul ini untuk melakukan API calls ke backend selain authentication.
 * Authentication menggunakan better-auth yang sudah dikonfigurasi di auth-client.ts
 */

import { getAuthToken as getStoredToken } from "./auth-client";

// Gunakan empty string untuk development (akan gunakan proxy dari vite.config.ts)
// Untuk production, gunakan full URL dari env
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "" // Empty string = gunakan same origin (proxy akan handle)
    : import.meta.env.VITE_APP_AUTH_URL || "http://localhost:8787";

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
 * // POST request
 * const { data } = await apiClient<Team>('/api/teams', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'Tim KP ABC' }),
 * });
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: "include", // Include cookies for better-auth
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Error: ${response.status}`,
        data: null,
      };
    }

    return data;
  } catch (error) {
    console.error("API Client Error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Network error",
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
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: {
        // Don't set Content-Type for FormData, browser will set it with boundary
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || `Error: ${response.status}`,
        data: null,
      };
    }

    return data;
  } catch (error) {
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
