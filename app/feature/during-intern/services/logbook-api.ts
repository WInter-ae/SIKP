/**
 * Student Logbook API Service
 * Handles logbook (catatan harian) CRUD operations
 */

import { ipost, iget, iput, idel } from "~/lib/api-client";
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

// ==================== API FUNCTIONS ====================

/**
 * Create new logbook entry
 * POST /api/logbooks
 */
export async function createLogbookEntry(
  data: CreateLogbookData
): Promise<ApiResponse<LogbookEntry>> {
  return ipost<LogbookEntry>("/api/logbooks", data);
}

/**
 * Get all logbook entries for current student
 * GET /api/logbooks?startDate=...&endDate=...&status=...
 */
export interface LogbookListResponse {
  internshipId: string;
  entries: LogbookEntry[];
}

export async function getLogbookEntries(params?: {
  startDate?: string;
  endDate?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}): Promise<ApiResponse<LogbookListResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.status) queryParams.append("status", params.status);
  
  const query = queryParams.toString();
  const url = query ? `/api/logbooks?${query}` : "/api/logbooks";
  
  return iget<LogbookListResponse>(url);
}

/**
 * Get single logbook entry by ID
 * GET /api/logbooks/:id
 */
export async function getLogbookEntry(
  id: string
): Promise<ApiResponse<LogbookEntry>> {
  return iget<LogbookEntry>(`/api/logbooks/${id}`);
}

/**
 * Update logbook entry
 * PUT /api/logbooks/:id
 */
export async function updateLogbookEntry(
  id: string,
  data: UpdateLogbookData
): Promise<ApiResponse<LogbookEntry>> {
  return iput<LogbookEntry>(`/api/logbooks/${id}`, data);
}

/**
 * Delete logbook entry (only if PENDING)
 * DELETE /api/logbooks/:id
 */
export async function deleteLogbookEntry(
  id: string
): Promise<ApiResponse<void>> {
  return idel<void>(`/api/logbooks/${id}`);
}

/**
 * Get logbook statistics
 * GET /api/logbooks/stats
 */
export async function getLogbookStats(): Promise<ApiResponse<LogbookStatsResponse>> {
  return iget<LogbookStatsResponse>("/api/logbooks/stats");
}

/**
 * Submit logbook for mentor approval (if needed)
 * POST /api/logbooks/:id/submit
 */
export async function submitLogbookForApproval(
  id: string
): Promise<ApiResponse<LogbookEntry>> {
  return ipost<LogbookEntry>(`/api/logbooks/${id}/submit`, {});
}

/**
 * Upload logbook photo
 * POST /api/logbooks/:id/photo
 */
export async function uploadLogbookPhoto(
  id: string,
  file: File
): Promise<ApiResponse<{ photoUrl: string }>> {
  const formData = new FormData();
  formData.append("photo", file);
  
  return ipost<{ photoUrl: string }>(`/api/logbooks/${id}/photo`, formData);
}
