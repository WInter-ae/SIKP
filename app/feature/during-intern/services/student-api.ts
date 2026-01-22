/**
 * Student Data API Service
 * Handles student (mahasiswa) profile and information
 */

import { get, put } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface StudentProfile {
  id: string;
  userId: string;
  nim: string;
  name: string;
  email: string;
  phone?: string;
  prodi: string;
  fakultas?: string;
  angkatan: string;
  semester: number;
  ipk?: number;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternshipData {
  id: string;
  studentId: string;
  company: string;
  position: string;
  mentorId?: string;
  mentorName?: string;
  dosenPembimbingId?: string;
  dosenPembimbingName?: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "AKTIF" | "SELESAI" | "BATAL";
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDetailResponse {
  student: StudentProfile;
  internship?: InternshipData;
}

// ==================== API FUNCTIONS ====================

/**
 * Get current student profile
 * GET /api/mahasiswa/profile
 */
export async function getMyProfile(): Promise<ApiResponse<StudentProfile>> {
  return get<StudentProfile>("/api/mahasiswa/profile");
}

/**
 * Get student by ID (for dosen/mentor)
 * GET /api/mahasiswa/:studentId
 */
export async function getStudentById(
  studentId: string
): Promise<ApiResponse<StudentDetailResponse>> {
  return get<StudentDetailResponse>(`/api/mahasiswa/${studentId}`);
}

/**
 * Get student by NIM
 * GET /api/mahasiswa/nim/:nim
 */
export async function getStudentByNim(
  nim: string
): Promise<ApiResponse<StudentDetailResponse>> {
  return get<StudentDetailResponse>(`/api/mahasiswa/nim/${nim}`);
}

/**
 * Update student profile
 * PUT /api/mahasiswa/profile
 */
export async function updateStudentProfile(
  data: Partial<Omit<StudentProfile, "id" | "userId" | "nim" | "createdAt" | "updatedAt">>
): Promise<ApiResponse<StudentProfile>> {
  return put<StudentProfile>("/api/mahasiswa/profile", data);
}

/**
 * Get current student's internship data
 * GET /api/mahasiswa/internship
 */
export async function getMyInternship(): Promise<ApiResponse<InternshipData>> {
  return get<InternshipData>("/api/mahasiswa/internship");
}

/**
 * Get internship data by student ID
 * GET /api/mahasiswa/:studentId/internship
 */
export async function getStudentInternship(
  studentId: string
): Promise<ApiResponse<InternshipData>> {
  return get<InternshipData>(`/api/mahasiswa/${studentId}/internship`);
}

/**
 * Update internship period (periode magang)
 * PUT /api/mahasiswa/internship/period
 */
export async function updateInternshipPeriod(data: {
  startDate: string; // ISO string or YYYY-MM-DD
  endDate: string; // ISO string or YYYY-MM-DD
}): Promise<ApiResponse<InternshipData>> {
  return put<InternshipData>("/api/mahasiswa/internship/period", data);
}
