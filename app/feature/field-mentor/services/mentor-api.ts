/**
 * Mentor API Service
 * Handles all mentor (pembimbing lapangan) related API calls
 */

import { post, get, put } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  position: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenteeData {
  id: string;
  userId: string;
  nim: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  mentorId: string;
  startDate: string;
  endDate: string;
  status: "AKTIF" | "SELESAI" | "BATAL";
  progress: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface AssessmentData {
  id: string;
  studentId: string;
  mentorId: string;
  kehadiran: number; // 0-100
  kerjasama: number; // 0-100
  sikapEtika: number; // 0-100
  prestasiKerja: number; // 0-100
  kreatifitas: number; // 0-100
  totalScore: number; // Weighted average
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get mentor profile (current logged in mentor)
 * GET /api/mentor/profile
 */
export async function getMentorProfile(): Promise<ApiResponse<MentorProfile>> {
  return get<MentorProfile>("/api/mentor/profile");
}

/**
 * Update mentor profile
 * PUT /api/mentor/profile
 */
export async function updateMentorProfile(
  data: Partial<Omit<MentorProfile, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<ApiResponse<MentorProfile>> {
  return put<MentorProfile>("/api/mentor/profile", data);
}

/**
 * Get all mentees (mahasiswa bimbingan) for current mentor
 * GET /api/mentor/mentees
 */
export async function getMentees(): Promise<ApiResponse<MenteeData[]>> {
  return get<MenteeData[]>("/api/mentor/mentees");
}

/**
 * Get single mentee detail
 * GET /api/mentor/mentees/:studentId
 */
export async function getMenteeDetail(
  studentId: string
): Promise<ApiResponse<MenteeData>> {
  return get<MenteeData>(`/api/mentor/mentees/${studentId}`);
}

/**
 * Get logbook entries for a student
 * GET /api/mentor/logbook/:studentId
 */
export async function getStudentLogbook(
  studentId: string
): Promise<ApiResponse<LogbookEntry[]>> {
  return get<LogbookEntry[]>(`/api/mentor/logbook/${studentId}`);
}

/**
 * Approve (paraf) logbook entry
 * POST /api/mentor/logbook/:logbookId/approve
 */
export async function approveLogbook(
  logbookId: string,
  signature: string
): Promise<ApiResponse<LogbookEntry>> {
  return post<LogbookEntry>(`/api/mentor/logbook/${logbookId}/approve`, {
    signature,
  });
}

/**
 * Approve all pending logbooks for a student
 * POST /api/mentor/logbook/:studentId/approve-all
 */
export async function approveAllLogbooks(
  studentId: string,
  signature: string
): Promise<ApiResponse<{ approved: number; logbooks: LogbookEntry[] }>> {
  return post<{ approved: number; logbooks: LogbookEntry[] }>(
    `/api/mentor/logbook/${studentId}/approve-all`,
    { signature }
  );
}

/**
 * Submit assessment (penilaian) for a student
 * POST /api/mentor/assessment
 */
export async function submitAssessment(data: {
  studentId: string;
  kehadiran: number;
  kerjasama: number;
  sikapEtika: number;
  prestasiKerja: number;
  kreatifitas: number;
  feedback?: string;
}): Promise<ApiResponse<AssessmentData>> {
  return post<AssessmentData>("/api/mentor/assessment", data);
}

/**
 * Get assessment for a student
 * GET /api/mentor/assessment/:studentId
 */
export async function getStudentAssessment(
  studentId: string
): Promise<ApiResponse<AssessmentData>> {
  return get<AssessmentData>(`/api/mentor/assessment/${studentId}`);
}

/**
 * Update existing assessment
 * PUT /api/mentor/assessment/:assessmentId
 */
export async function updateAssessment(
  assessmentId: string,
  data: Partial<Omit<AssessmentData, "id" | "studentId" | "mentorId" | "createdAt" | "updatedAt" | "totalScore">>
): Promise<ApiResponse<AssessmentData>> {
  return put<AssessmentData>(`/api/mentor/assessment/${assessmentId}`, data);
}
