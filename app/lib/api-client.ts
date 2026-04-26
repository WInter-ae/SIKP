/**
 * API Client untuk SIKP Backend
 *
 * Gunakan modul ini untuk melakukan API calls ke backend.
 * Authentication menggunakan SSO yang sudah dikonfigurasi di auth-client.ts
 *
 * @example Penggunaan standar (pengajuan KP):
 *   import { sikpClient } from "~/lib/api-client";
 *   const { data } = await sikpClient.get<Team[]>("/api/teams/my-teams");
 *
 * @example Untuk layanan internship (logbook, mentor, penilaian):
 *   import { internshipClient } from "~/lib/api-client";
 *   const { data } = await internshipClient.get<Logbook[]>("/api/logbook");
 */

import { getAuthToken as getStoredToken } from "./auth-client";
import { clearAuthSession } from "./auth-client";
import {
  parseJsonResponse,
  getErrorMessage,
  isNetworkError,
  logApiError,
  ApiError,
  API_ERROR_MESSAGES,
} from "./api-error";
import { z } from "zod";

// ==================== ENVIRONMENT & CONFIG ====================

function isBrowser() {
  return typeof window !== "undefined";
}

const DEFAULT_LOCAL_API_BASE_URL = "http://localhost:3000";
const DEFAULT_PROD_API_BASE_URL =
  "https://backend-sikp.backend-sikp.workers.dev";

/** Base URL untuk layanan pengajuan KP (submission, team, dll.) */
export const API_BASE_URL =
  import.meta.env.VITE_SIKP_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_APP_AUTH_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? DEFAULT_LOCAL_API_BASE_URL
    : DEFAULT_PROD_API_BASE_URL);

/** Base URL untuk layanan pelaksanaan magang (logbook, mentor, penilaian) */
export const INTERNSHIP_API_BASE_URL =
  import.meta.env.VITE_API_INTERNSHIP_URL ||
  "https://backend-sikp.mukarrobinujiantik.workers.dev";

// ==================== TYPES ====================

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

// ==================== AUTH HELPERS ====================

function getAuthToken(): string | null {
  return getStoredToken();
}

function handleUnauthorized() {
  clearAuthSession();

  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (
      currentPath !== "/login" &&
      currentPath !== "/callback" &&
      currentPath !== "/identity-chooser"
    ) {
      window.location.assign("/login?reason=session_expired");
    }
  }
}

// ==================== REQUEST BUILDER ====================

function buildHeaders(
  token: string | null,
  isFormData: boolean,
  customHeaders?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {};

  // Don't force Content-Type for FormData (browser sets it with boundary)
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Browser app authenticates via httpOnly cookie session.
  // Only attach Bearer token in non-browser (SSR/server) contexts.
  if (token && !isBrowser()) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  return headers;
}

// ==================== CORE API CLIENT ====================

/**
 * Low-level API client — dipakai oleh factory `createApiClient`.
 * Penanganan error (network, HTTP non-2xx, JSON parse) dilakukan secara
 * terpusat di sini sehingga setiap service tidak perlu try/catch sendiri.
 *
 * @param baseUrl  - Base URL untuk request (misal: API_BASE_URL atau INTERNSHIP_API_BASE_URL)
 * @param endpoint - Path endpoint (misal: '/api/teams/my-teams')
 * @param options  - Fetch options standar
 * @param schema   - (Opsional) Zod schema untuk validasi response data saat runtime
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl: string = API_BASE_URL,
  schema?: z.ZodType<T>,
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;

  try {
    const headers = buildHeaders(
      token,
      isFormData,
      options.headers as Record<string, string>,
    );

    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
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

    // Runtime type validation via Zod (if schema is provided and request succeeded)
    if (
      response.ok &&
      schema &&
      data &&
      "data" in (data as Record<string, unknown>)
    ) {
      const payloadData = (data as ApiResponse<T>).data;
      if (payloadData !== null && payloadData !== undefined) {
        const validation = schema.safeParse(payloadData);
        if (!validation.success) {
          console.error("❌ Zod Validation Error:", validation.error);
          return {
            success: false,
            message:
              "Format data dari server tidak sesuai tipe yang diharapkan (Runtime Validation Failed)",
            data: null,
          };
        }
        // Force the validated data back into the payload
        (data as ApiResponse<T>).data = validation.data;
      }
    }

    // Handle non-OK responses
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
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
    if (isNetworkError(error)) {
      console.error("❌ Network Error:", error);
      return {
        success: false,
        message: API_ERROR_MESSAGES.NETWORK_ERROR,
        data: null,
      };
    }

    const errorMessage =
      error instanceof Error ? error.message : API_ERROR_MESSAGES.UNKNOWN_ERROR;
    console.error("❌ API Client Error:", error);

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}

// ==================== CLIENT FACTORY ====================

/**
 * Buat instance API client dengan base URL tertentu.
 * Setiap method sudah membawa base URL-nya sendiri.
 *
 * @example
 *   const client = createApiClient("https://my-api.workers.dev");
 *   const { data } = await client.get<Team[]>("/api/teams");
 */
export function createApiClient(baseUrl: string) {
  return {
    /**
     * GET request
     * @param endpoint - path endpoint
     * @param params   - optional query string params
     * @param schema   - opsional Zod schema validasi response
     */
    get<T>(
      endpoint: string,
      params?: Record<string, string>,
      schema?: z.ZodType<T>,
    ) {
      const url = params
        ? `${endpoint}?${new URLSearchParams(params).toString()}`
        : endpoint;
      return apiClient<T>(url, { method: "GET" }, baseUrl, schema);
    },

    /**
     * POST request
     * @param endpoint - path endpoint
     * @param body     - request body (akan di-JSON.stringify)
     * @param schema   - opsional Zod schema validasi response
     */
    post<T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) {
      return apiClient<T>(
        endpoint,
        {
          method: "POST",
          body: body !== undefined ? JSON.stringify(body) : undefined,
        },
        baseUrl,
        schema,
      );
    },

    /**
     * PUT request
     */
    put<T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) {
      return apiClient<T>(
        endpoint,
        {
          method: "PUT",
          body: body !== undefined ? JSON.stringify(body) : undefined,
        },
        baseUrl,
        schema,
      );
    },

    /**
     * PATCH request
     */
    patch<T>(endpoint: string, body?: unknown, schema?: z.ZodType<T>) {
      return apiClient<T>(
        endpoint,
        {
          method: "PATCH",
          body: body !== undefined ? JSON.stringify(body) : undefined,
        },
        baseUrl,
        schema,
      );
    },

    /**
     * DELETE request
     */
    del<T>(endpoint: string, schema?: z.ZodType<T>) {
      return apiClient<T>(endpoint, { method: "DELETE" }, baseUrl, schema);
    },

    /**
     * Upload file (multipart/form-data) via POST
     * @param endpoint - path endpoint
     * @param formData - FormData berisi file dan field tambahan
     * @param schema   - opsional Zod schema validasi response
     */
    upload<T>(endpoint: string, formData: FormData, schema?: z.ZodType<T>) {
      return apiClient<T>(
        endpoint,
        { method: "POST", body: formData },
        baseUrl,
        schema,
      );
    },

    /**
     * Custom fetch — untuk kasus yang membutuhkan opsi RequestInit penuh
     */
    request<T>(
      endpoint: string,
      options: RequestInit = {},
      schema?: z.ZodType<T>,
    ) {
      return apiClient<T>(endpoint, options, baseUrl, schema);
    },
  };
}

// ==================== CLIENT INSTANCES ====================

/**
 * Client untuk layanan pengajuan KP (submission, team, surat, dll.)
 * Menggunakan API_BASE_URL
 */
export const sikpClient = createApiClient(API_BASE_URL);

/**
 * Client untuk layanan pelaksanaan magang (logbook, mentor, penilaian)
 * Menggunakan INTERNSHIP_API_BASE_URL
 */
export const internshipClient = createApiClient(INTERNSHIP_API_BASE_URL);

// ==================== LEGACY COMPAT EXPORTS ====================
// Fungsi-fungsi di bawah dipertahankan sementara untuk backward compatibility
// dengan file-file service lama yang belum dimigrasi.
// Akan dihapus setelah semua service dimigrasi ke sikpClient.*

/** @deprecated Gunakan sikpClient.get() */
export function get<T>(endpoint: string, params?: Record<string, string>) {
  return sikpClient.get<T>(endpoint, params);
}

/** @deprecated Gunakan sikpClient.post() */
export function post<T>(endpoint: string, body?: unknown) {
  return sikpClient.post<T>(endpoint, body);
}

/** @deprecated Gunakan sikpClient.put() */
export function put<T>(endpoint: string, body?: unknown) {
  return sikpClient.put<T>(endpoint, body);
}

/** @deprecated Gunakan sikpClient.patch() */
export function patch<T>(endpoint: string, body?: unknown) {
  return sikpClient.patch<T>(endpoint, body);
}

/** @deprecated Gunakan sikpClient.del() */
export function del<T>(endpoint: string) {
  return sikpClient.del<T>(endpoint);
}

/** @deprecated Gunakan sikpClient.upload() */
export function uploadFile<T>(endpoint: string, formData: FormData) {
  return sikpClient.upload<T>(endpoint, formData);
}
