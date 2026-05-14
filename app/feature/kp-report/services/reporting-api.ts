import { internshipClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export interface TitleSubmission {
  internshipId: string;
  title: string;
  description: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  // Reviewer / approver info (dosen PA)
  reviewerId?: string;
  reviewerName?: string;
  reviewerNip?: string;
  reviewerEmail?: string;
  // Backend may use different field names
  approvedBy?: string;
  approvedByName?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  lecturer?: {
    id: string;
    name: string;
    nip?: string;
    email?: string;
  };
  supervisor?: {
    id: string;
    name: string;
    nip?: string;
    email?: string;
  };
}

export interface ReportSubmission {
  internshipId: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  uploadedAt: string;
}

/**
 * Submit internship title (Standard Flow)
 * POST /api/reporting/title
 */
export async function submitInternshipTitle(data: {
  internshipId: string;
  title: string;
  description: string;
}): Promise<ApiResponse<TitleSubmission>> {
  return internshipClient.post<TitleSubmission>("/api/reporting/title", data);
}

/**
 * Get current title status
 * GET /api/reporting/title/:internshipId
 */
export async function getTitleStatus(internshipId: string): Promise<ApiResponse<TitleSubmission>> {
  return internshipClient.get<TitleSubmission>(`/api/reporting/title/${internshipId}`);
}

/**
 * Submit report file (Standard Flow)
 * POST /api/reporting/report
 */
export async function submitInternshipReport(data: {
  internshipId: string;
  file: File;
}): Promise<ApiResponse<ReportSubmission>> {
  const formData = new FormData();
  formData.append("internshipId", data.internshipId);
  formData.append("file", data.file);
  
  return internshipClient.upload<ReportSubmission>("/api/reporting/report", formData);
}

/**
 * Fast track submission (Title + Report)
 * POST /api/reporting/submit-fast
 */
export async function submitFastTrack(data: {
  internshipId: string;
  title: string;
  description: string;
  file: File;
}): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append("internshipId", data.internshipId);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("file", data.file);

  return internshipClient.upload<any>("/api/reporting/submit-fast", formData);
}

/**
 * Get report status
 * GET /api/reporting/report/:internshipId
 */
export async function getReportStatus(internshipId: string): Promise<ApiResponse<ReportSubmission>> {
  return internshipClient.get<ReportSubmission>(`/api/reporting/report/${internshipId}`);
}
