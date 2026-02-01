/**
 * API Client untuk SIKP Backend
 *
 * Gunakan modul ini untuk melakukan API calls ke backend selain authentication.
 * Authentication menggunakan better-auth yang sudah dikonfigurasi di auth-client.ts
 */

import { getAuthToken as getStoredToken } from "./auth-client";

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

  try {
    // Detect if body is FormData
    const isFormData = options.body instanceof FormData;

    // Build headers - don't force Content-Type for FormData
    const headers: Record<string, string> = {};
    if (!isFormData && !options.headers) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (options.headers && typeof options.headers === "object") {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      // Use cookies only when same-origin (no explicit base URL)
      credentials: API_BASE_URL ? "omit" : "include",
      headers,
    });

    // Check if response has content
    const contentType = response.headers.get("content-type");
    const hasJsonContent = contentType && contentType.includes("application/json");
    
    let data;
    try {
      // Only parse JSON if content-type is JSON and body is not empty
      const text = await response.text();
      
      if (!text || text.trim() === "") {
        console.error("❌ Empty response from backend:", {
          endpoint,
          status: response.status,
          statusText: response.statusText
        });
        
        return {
          success: false,
          message: `Backend error: Empty response (Status ${response.status})`,
          data: null,
        };
      }
      
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error("❌ Invalid JSON response:", jsonError);
      console.error("Response endpoint:", endpoint);
      console.error("Response status:", response.status);
      
      return {
        success: false,
        message: `Backend error: Invalid JSON response (Status ${response.status})`,
        data: null,
      };
    }

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
      // Use cookies only when same-origin
      credentials: API_BASE_URL ? "omit" : "include",
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
