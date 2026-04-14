// Service for generating logbook DOCX with e-signature from database

import { apiClient } from "~/lib/api-client";
import type {
  GenerateLogbookRequest,
  GenerateLogbookResponse,
  LogbookDocxData,
} from "../types/logbook.d";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * Generate DOCX logbook untuk mahasiswa
 * Signature diambil otomatis dari mentors.signature di database
 * 
 * @param request - Optional filters (weekNumber, studentId)
 * @returns URL download DOCX file
 */
export async function generateLogbookDocx(
  request?: GenerateLogbookRequest
): Promise<ApiResponse<{ docxUrl: string; fileName: string }>> {
  try {
    const queryParams = new URLSearchParams();
    if (request?.weekNumber) {
      queryParams.append('weekNumber', request.weekNumber.toString());
    }
    if (request?.studentId) {
      queryParams.append('studentId', request.studentId);
    }

    const response = await apiClient<{ docxUrl: string; fileName: string; generatedAt: string }>(
      `/api/logbook/generate-docx${queryParams.toString() ? '?' + queryParams.toString() : ''}`,
      { method: "POST" }
    );

    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to generate logbook DOCX",
      data: null,
    };
  }
}

/**
 * Get logbook data for preview before generating DOCX
 * 
 * @param weekNumber - Optional specific week
 * @returns Logbook data with student info and entries
 */
export async function getLogbookPreview(
  weekNumber?: number
): Promise<ApiResponse<LogbookDocxData>> {
  try {
    const queryParams = weekNumber ? `?weekNumber=${weekNumber}` : '';
    
    const response = await apiClient<LogbookDocxData>(
      `/api/logbook/preview${queryParams}`,
      { method: "GET" }
    );

    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to get logbook preview",
      data: null,
    };
  }
}

/**
 * Get download URL for existing logbook DOCX
 * 
 * @param logbookId - Logbook record ID
 * @returns Signed URL for download
 */
export function getLogbookDownloadUrl(logbookId: string): string {
  return `/api/logbook/${logbookId}/download`;
}

/**
 * Check if logbook is ready for generation
 * Requirements:
 * - At least 1 approved entry
 * - Mentor signature exists in database
 * 
 * @returns Validation result
 */
export async function validateLogbookGeneration(): Promise<
  ApiResponse<{ canGenerate: boolean; reason?: string }>
> {
  try {
    const response = await apiClient<{ canGenerate: boolean; reason?: string }>(
      "/api/logbook/validate-generation",
      { method: "GET" }
    );

    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to validate logbook",
      data: null,
    };
  }
}
