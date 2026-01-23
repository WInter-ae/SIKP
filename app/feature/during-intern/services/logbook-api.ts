/**
 * Student Logbook API Service
 * Handles logbook (catatan harian) CRUD operations
 */

import { post, get, put, del } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface LogbookEntry {
  id: string;
  studentId: string;
  date: string;
  activity: string;
  description: string;
  mentorSignature?: string;
  mentorSignedAt?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogbookData {
  date: string;
  activity: string;
  description: string;
}

export interface UpdateLogbookData {
  date?: string;
  activity?: string;
  description?: string;
}

export interface LogbookStatsResponse {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

// ==================== API FUNCTIONS ====================

/**
 * Create new logbook entry
 * POST /api/logbook
 */
export async function createLogbookEntry(
  data: CreateLogbookData
): Promise<ApiResponse<LogbookEntry>> {
  return post<LogbookEntry>("/api/logbook", data);
}

/**
 * Get all logbook entries for current student
 * GET /api/logbook?startDate=...&endDate=...
 */
export async function getLogbookEntries(params?: {
  startDate?: string;
  endDate?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}): Promise<ApiResponse<LogbookEntry[]>> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.status) queryParams.append("status", params.status);
  
  const query = queryParams.toString();
  const url = query ? `/api/logbook?${query}` : "/api/logbook";
  
  return get<LogbookEntry[]>(url);
}

/**
 * Get single logbook entry by ID
 * GET /api/logbook/:id
 */
export async function getLogbookEntry(
  id: string
): Promise<ApiResponse<LogbookEntry>> {
  return get<LogbookEntry>(`/api/logbook/${id}`);
}

/**
 * Update logbook entry
 * PUT /api/logbook/:id
 */
export async function updateLogbookEntry(
  id: string,
  data: UpdateLogbookData
): Promise<ApiResponse<LogbookEntry>> {
  return put<LogbookEntry>(`/api/logbook/${id}`, data);
}

/**
 * Delete logbook entry (only if PENDING)
 * DELETE /api/logbook/:id
 */
export async function deleteLogbookEntry(
  id: string
): Promise<ApiResponse<void>> {
  return del<void>(`/api/logbook/${id}`);
}

/**
 * Get logbook statistics
 * GET /api/logbook/stats
 */
export async function getLogbookStats(): Promise<
  ApiResponse<LogbookStatsResponse>
> {
  return get<LogbookStatsResponse>("/api/logbook/stats");
}

/**
 * Submit logbook for mentor approval
 * POST /api/logbook/:id/submit
 */
export async function submitLogbookForApproval(
  id: string
): Promise<ApiResponse<LogbookEntry>> {
  return post<LogbookEntry>(`/api/logbook/${id}/submit`, {});
}
