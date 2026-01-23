/**
 * Submission Service
 * Wrapper untuk Submission API endpoints
 */

import { post, get, patch, uploadFile } from "~/lib/api-client";
import type {
  Submission,
  SubmissionDocument,
  GeneratedLetter,
  DocumentType,
} from "~/lib/types";

/**
 * Create a new submission
 */
export async function createSubmission(teamId: string) {
  return post<Submission>("/api/submissions", { teamId });
}

/**
 * Get user's submissions
 */
export async function getMySubmissions() {
  return get<Submission[]>("/api/submissions/my-submissions");
}

/**
 * Get submission detail
 */
export async function getSubmissionDetail(submissionId: string) {
  return get<Submission>(`/api/submissions/${submissionId}`);
}

/**
 * Update submission
 */
export async function updateSubmission(
  submissionId: string,
  data: Partial<Submission>,
) {
  return patch<Submission>(`/api/submissions/${submissionId}`, data);
}

/**
 * Submit submission for review
 */
export async function submitForReview(submissionId: string) {
  return post<Submission>(`/api/submissions/${submissionId}/submit`);
}

/**
 * Upload submission document
 */
export async function uploadDocument(
  submissionId: string,
  file: File,
  documentType: DocumentType,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  return uploadFile<SubmissionDocument>(
    `/api/submissions/${submissionId}/documents`,
    formData,
  );
}

/**
 * Get submission documents
 */
export async function getSubmissionDocuments(submissionId: string) {
  return get<SubmissionDocument[]>(
    `/api/submissions/${submissionId}/documents`,
  );
}

/**
 * (Admin) Get all submissions
 */
export async function getAllSubmissions() {
  return get<Submission[]>("/api/admin/submissions");
}

/**
 * (Admin) Get submissions by status
 */
export async function getSubmissionsByStatus(status: string) {
  return get<Submission[]>(`/api/admin/submissions/status/${status}`);
}

/**
 * (Admin) Get submission detail
 */
export async function getAdminSubmissionDetail(submissionId: string) {
  return get<
    Submission & { documents: SubmissionDocument[]; letters: GeneratedLetter[] }
  >(`/api/admin/submissions/${submissionId}`);
}

/**
 * (Admin) Approve submission
 */
export async function approveSubmission(
  submissionId: string,
  autoGenerateLetter = false,
) {
  return post<Submission>(`/api/admin/submissions/${submissionId}/approve`, {
    autoGenerateLetter,
  });
}

/**
 * (Admin) Reject submission
 */
export async function rejectSubmission(submissionId: string, reason: string) {
  return post<Submission>(`/api/admin/submissions/${submissionId}/reject`, {
    reason,
  });
}

/**
 * (Admin) Generate letter
 */
export async function generateLetter(
  submissionId: string,
  format: "pdf" | "docx" = "pdf",
) {
  return post<GeneratedLetter>(
    `/api/admin/submissions/${submissionId}/generate-letter`,
    { format },
  );
}
