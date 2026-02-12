/**
 * KP Report API Service
 * Handles internship report upload and management
 */

import { post, get, put, uploadFile } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface KPReport {
  id: string;
  studentId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REVISION" | "REJECTED";
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadReportResponse {
  report: KPReport;
  uploadUrl?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Upload KP report file
 * POST /api/report/upload (multipart/form-data)
 */
export async function uploadKPReport(
  file: File,
  metadata?: {
    description?: string;
    notes?: string;
  },
): Promise<ApiResponse<UploadReportResponse>> {
  const formData = new FormData();
  formData.append("file", file);

  if (metadata?.description) {
    formData.append("description", metadata.description);
  }
  if (metadata?.notes) {
    formData.append("notes", metadata.notes);
  }

  return uploadFile<UploadReportResponse>("/api/report/upload", formData);
}

/**
 * Get current student's report
 * GET /api/report
 */
export async function getMyReport(): Promise<ApiResponse<KPReport>> {
  return get<KPReport>("/api/report");
}

/**
 * Get report by student ID (for dosen/mentor)
 * GET /api/report/student/:studentId
 */
export async function getStudentReport(
  studentId: string,
): Promise<ApiResponse<KPReport>> {
  return get<KPReport>(`/api/report/student/${studentId}`);
}

/**
 * Submit report for review
 * POST /api/report/:reportId/submit
 */
export async function submitReport(
  reportId: string,
): Promise<ApiResponse<KPReport>> {
  return post<KPReport>(`/api/report/${reportId}/submit`, {});
}

/**
 * Update report metadata (not file)
 * PUT /api/report/:reportId
 */
export async function updateReportMetadata(
  reportId: string,
  data: {
    description?: string;
    notes?: string;
  },
): Promise<ApiResponse<KPReport>> {
  return put<KPReport>(`/api/report/${reportId}`, data);
}

/**
 * Delete report (only if DRAFT)
 * DELETE /api/report/:reportId
 */
export async function deleteReport(
  reportId: string,
): Promise<ApiResponse<void>> {
  // Using post with delete action since del might not be defined
  return post<void>(`/api/report/${reportId}/delete`, {});
}

/**
 * Download report file
 * GET /api/report/:reportId/download
 */
export function getReportDownloadUrl(reportId: string): string {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";
  return `${API_BASE_URL}/api/report/${reportId}/download`;
}
