/**
 * Student Logbook API Service
 * Handles logbook (catatan harian) CRUD operations
 *
 * Menggunakan internshipClient dari api-client sesuai pola main.
 */

import { internshipClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface LogbookEntry {
  id: string;
  internshipId: string;
  date: string;
  activity: string;
  description: string;
  hours?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogbookData {
  date: string;
  activity: string;
  description: string;
  hours?: number;
}

export interface UpdateLogbookData {
  date?: string;
  activity?: string;
  description?: string;
  hours?: number;
}

export interface LogbookStatsResponse {
  internshipId: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalHours: number;
  approvedHours: number;
}

export interface LogbookListResponse {
  internshipId: string;
  entries: LogbookEntry[];
}

// ==================== API FUNCTIONS ====================

/**
 * Create new logbook entry
 * POST /api/logbooks
 */
export async function createLogbookEntry(
  data: CreateLogbookData,
): Promise<ApiResponse<LogbookEntry>> {
  return internshipClient.post<LogbookEntry>("/api/logbooks", data);
}

/**
 * Get all logbook entries for current student
 * GET /api/logbooks?startDate=...&endDate=...&status=...
 */
export async function getLogbookEntries(params?: {
  startDate?: string;
  endDate?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}): Promise<ApiResponse<LogbookListResponse>> {
  const queryParams: Record<string, string> = {};
  if (params?.startDate) queryParams.startDate = params.startDate;
  if (params?.endDate) queryParams.endDate = params.endDate;
  if (params?.status) queryParams.status = params.status;

  return internshipClient.get<LogbookListResponse>(
    "/api/logbooks",
    Object.keys(queryParams).length > 0 ? queryParams : undefined,
  );
}

/**
 * Get logbook statistics
 * GET /api/logbooks/stats
 */
export async function getLogbookStats(): Promise<
  ApiResponse<LogbookStatsResponse>
> {
  return internshipClient.get<LogbookStatsResponse>("/api/logbooks/stats");
}

/**
 * Get single logbook entry by ID
 * GET /api/logbooks/:id
 */
export async function getLogbookEntry(
  id: string,
): Promise<ApiResponse<LogbookEntry>> {
  return internshipClient.get<LogbookEntry>(`/api/logbooks/${id}`);
}

/**
 * Update logbook entry (only if PENDING)
 * PUT /api/logbooks/:id
 */
export async function updateLogbookEntry(
  id: string,
  data: UpdateLogbookData,
): Promise<ApiResponse<LogbookEntry>> {
  return internshipClient.put<LogbookEntry>(`/api/logbooks/${id}`, data);
}

/**
 * Delete logbook entry (only if PENDING)
 * DELETE /api/logbooks/:id
 */
export async function deleteLogbookEntry(
  id: string,
): Promise<ApiResponse<void>> {
  return internshipClient.del<void>(`/api/logbooks/${id}`);
}

/**
 * Submit logbook for mentor approval
 * POST /api/logbooks/:id/submit
 */
export async function submitLogbookForApproval(
  id: string,
): Promise<ApiResponse<LogbookEntry>> {
  return internshipClient.post<LogbookEntry>(`/api/logbooks/${id}/submit`, {});
}

/**
 * Upload foto kegiatan logbook (Max 2MB, JPEG/PNG/WebP)
 * POST /api/logbooks/:id/photo
 * Field name: "photo" (sesuai middleware validateFileUpload backend)
 */
export async function uploadLogbookPhoto(
  id: string,
  file: File,
): Promise<ApiResponse<{ photoUrl: string }>> {
  const formData = new FormData();
  formData.append("photo", file);
  return internshipClient.upload<{ photoUrl: string }>(
    `/api/logbooks/${id}/photo`,
    formData,
  );
}
