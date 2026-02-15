/**
 * API Error handling utilities
 */

/**
 * Standard error messages
 */
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: "Koneksi jaringan bermasalah. Periksa koneksi internet Anda.",
  UNAUTHORIZED: "Sesi Anda telah berakhir. Silakan login kembali.",
  FORBIDDEN: "Anda tidak memiliki akses untuk melakukan aksi ini.",
  NOT_FOUND: "Data yang diminta tidak ditemukan.",
  VALIDATION_ERROR: "Data yang Anda kirim tidak valid.",
  SERVER_ERROR: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
  UNKNOWN_ERROR: "Terjadi kesalahan yang tidak diketahui.",
  EMPTY_RESPONSE: "Server mengirim respons kosong.",
  INVALID_JSON: "Respons dari server tidak valid.",
} as const;

/**
 * API Error class with additional context
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Get user-friendly error message based on status code
 */
export function getErrorMessage(statusCode?: number, defaultMessage?: string): string {
  if (!statusCode) {
    return defaultMessage || API_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  switch (statusCode) {
    case 401:
      return API_ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return API_ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return API_ERROR_MESSAGES.NOT_FOUND;
    case 422:
      return API_ERROR_MESSAGES.VALIDATION_ERROR;
    case 500:
    case 502:
    case 503:
      return API_ERROR_MESSAGES.SERVER_ERROR;
    default:
      return defaultMessage || API_ERROR_MESSAGES.UNKNOWN_ERROR;
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes("fetch") || error.message.includes("network");
  }
  return false;
}

/**
 * Parse JSON safely with error handling
 */
export async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text || text.trim() === "") {
    throw new ApiError(
      API_ERROR_MESSAGES.EMPTY_RESPONSE,
      response.status,
      response.url
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new ApiError(
      API_ERROR_MESSAGES.INVALID_JSON,
      response.status,
      response.url,
      error
    );
  }
}

/**
 * Log API error for debugging
 */
export function logApiError(error: ApiError | Error, context?: string): void {
  console.error(`❌ API Error${context ? ` [${context}]` : ""}:`, {
    message: error.message,
    ...(error instanceof ApiError && {
      statusCode: error.statusCode,
      endpoint: error.endpoint,
      originalError: error.originalError,
    }),
  });
}
