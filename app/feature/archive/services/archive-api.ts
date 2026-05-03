import { internshipClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export interface ArchiveInternship {
  id: string;
  studentId: string;
  studentName: string;
  nim: string;
  companyName: string;
  position?: string;
  startDate: string;
  endDate: string;
  status: "SELESAI" | "BATAL";
  academicSupervisor?: string;
  finalScore?: number;
  finalGrade?: string;
  reportUrl?: string;
}

export interface ArchiveSubmission {
  id: string;
  studentName: string;
  nim: string;
  companyName: string;
  status: string;
  submittedAt: string;
}

/**
 * Get internship history for current student
 * GET /api/archive/student
 */
export async function getStudentArchive(): Promise<ApiResponse<ArchiveInternship[]>> {
  return internshipClient.get<ArchiveInternship[]>("/api/archive/student");
}

/**
 * Get all finished internships (Admin side)
 * GET /api/archive/admin/internships
 */
export async function getAdminInternshipArchive(): Promise<ApiResponse<ArchiveInternship[]>> {
  return internshipClient.get<ArchiveInternship[]>("/api/archive/admin/internships");
}

/**
 * Get all finished submissions (Admin side)
 * GET /api/archive/admin/submissions
 */
export async function getAdminSubmissionArchive(): Promise<ApiResponse<ArchiveSubmission[]>> {
  return internshipClient.get<ArchiveSubmission[]>("/api/archive/admin/submissions");
}

/**
 * Manually archive an internship
 * POST /api/archive/internship/:id
 */
export async function manuallyArchiveInternship(id: string): Promise<ApiResponse<null>> {
  return internshipClient.post<null>(`/api/archive/internship/${id}`, {});
}
