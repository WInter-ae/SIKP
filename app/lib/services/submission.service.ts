/**
 * Submission Service (wrapper simpel)
 * Wrapper untuk Submission API endpoints — gunakan submission-api.service.ts
 * untuk fungsi yang lebih lengkap (dengan logika bisnis tambahan).
 */

import { sikpClient } from "~/lib/api-client";
import type {
  Submission,
  SubmissionDocument,
  GeneratedLetter,
  DocumentType,
} from "~/lib/types";

/** Create a new submission. */
export async function createSubmission(teamId: string) {
  return sikpClient.post<Submission>("/api/submissions", { teamId });
}

/** Get user's submissions. */
export async function getMySubmissions() {
  return sikpClient.get<Submission[]>("/api/submissions/my-submissions");
}

/** Get submission detail. */
export async function getSubmissionDetail(submissionId: string) {
  return sikpClient.get<Submission>(`/api/submissions/${submissionId}`);
}

/** Update submission. */
export async function updateSubmission(submissionId: string, data: Partial<Submission>) {
  return sikpClient.request<Submission>(`/api/submissions/${submissionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/** Submit submission for review. */
export async function submitForReview(submissionId: string) {
  return sikpClient.post<Submission>(`/api/submissions/${submissionId}/submit`);
}

/** Upload submission document. */
export async function uploadDocument(
  submissionId: string,
  file: File,
  documentType: DocumentType,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  return sikpClient.upload<SubmissionDocument>(
    `/api/submissions/${submissionId}/documents`,
    formData,
  );
}

/** Get submission documents. */
export async function getSubmissionDocuments(submissionId: string) {
  return sikpClient.get<SubmissionDocument[]>(
    `/api/submissions/${submissionId}/documents`,
  );
}

/** (Admin) Get all submissions. */
export async function getAllSubmissions() {
  return sikpClient.get<Submission[]>("/api/admin/submissions");
}

/** (Admin) Get submissions by status. */
export async function getSubmissionsByStatus(status: string) {
  return sikpClient.get<Submission[]>(`/api/admin/submissions/status/${status}`);
}

/** (Admin) Get submission detail. */
export async function getAdminSubmissionDetail(submissionId: string) {
  return sikpClient.get<Submission & { documents: SubmissionDocument[]; letters: GeneratedLetter[] }>(
    `/api/admin/submissions/${submissionId}`,
  );
}

/** (Admin) Approve submission. */
export async function approveSubmission(submissionId: string, autoGenerateLetter = false) {
  return sikpClient.post<Submission>(`/api/admin/submissions/${submissionId}/approve`, { autoGenerateLetter });
}

/** (Admin) Reject submission. */
export async function rejectSubmission(submissionId: string, reason: string) {
  return sikpClient.post<Submission>(`/api/admin/submissions/${submissionId}/reject`, { reason });
}

/** (Admin) Generate letter. */
export async function generateLetter(submissionId: string, format: "pdf" | "docx" = "pdf") {
  return sikpClient.post<GeneratedLetter>(
    `/api/admin/submissions/${submissionId}/generate-letter`,
    { format },
  );
}
