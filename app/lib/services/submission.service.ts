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
import { API_ENDPOINTS } from "~/lib/constants/endpoints";
import { z } from "zod";
import {
  SubmissionSchema,
  SubmissionDocumentSchema,
} from "~/lib/schemas/api-schemas";

/** Create a new submission. */
export async function createSubmission(teamId: string) {
  return sikpClient.post<Submission>(
    API_ENDPOINTS.SUBMISSION.CREATE,
    { teamId },
    SubmissionSchema,
  );
}

/** Get user's submissions. */
export async function getMySubmissions() {
  return sikpClient.get<Submission[]>(
    API_ENDPOINTS.SUBMISSION.GET_MY,
    undefined,
    z.array(SubmissionSchema),
  );
}

/** Get submission detail. */
export async function getSubmissionDetail(submissionId: string) {
  return sikpClient.get<Submission>(
    API_ENDPOINTS.SUBMISSION.UPDATE(submissionId),
    undefined,
    SubmissionSchema,
  );
}

/** Update submission. */
export async function updateSubmission(
  submissionId: string,
  data: Partial<Submission>,
) {
  return sikpClient.request<Submission>(
    API_ENDPOINTS.SUBMISSION.UPDATE(submissionId),
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    SubmissionSchema,
  );
}

/** Submit submission for review. */
export async function submitForReview(submissionId: string) {
  return sikpClient.post<Submission>(
    `${API_ENDPOINTS.SUBMISSION.UPDATE(submissionId)}/submit`,
    undefined,
    SubmissionSchema,
  );
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
    `${API_ENDPOINTS.SUBMISSION.UPDATE(submissionId)}/documents`,
    formData,
    SubmissionDocumentSchema,
  );
}

/** Get submission documents. */
export async function getSubmissionDocuments(submissionId: string) {
  return sikpClient.get<SubmissionDocument[]>(
    `${API_ENDPOINTS.SUBMISSION.UPDATE(submissionId)}/documents`,
    undefined,
    z.array(SubmissionDocumentSchema),
  );
}

/** Get submission status options. */
export async function getSubmissionStatusOptions() {
  return sikpClient.get<{ id: string; label: string }[]>(
    "/api/submissions/status-options",
  );
}

// ==================== ADMIN ENDPOINTS ====================

/** Get all submissions (Admin). */
export async function getAllSubmissions(status?: string) {
  const url = status
    ? `/api/admin/submissions/status/${status}`
    : API_ENDPOINTS.SUBMISSION.GET_ALL_ADMIN;
  return sikpClient.get<Submission[]>(
    url,
    undefined,
    z.array(SubmissionSchema),
  );
}

/** Get submission detail (Admin). */
export async function getAdminSubmissionDetail(submissionId: string) {
  return sikpClient.get<Submission>(
    `${API_ENDPOINTS.SUBMISSION.GET_ALL_ADMIN}/${submissionId}`,
    undefined,
    SubmissionSchema,
  );
}

/** Approve submission. */
export async function approveSubmission(
  submissionId: string,
  autoGenerateLetter = false,
) {
  return sikpClient.post<Submission>(
    `${API_ENDPOINTS.SUBMISSION.GET_ALL_ADMIN}/${submissionId}/approve`,
    { autoGenerateLetter },
    SubmissionSchema,
  );
}

/** Reject submission. */
export async function rejectSubmission(submissionId: string, reason: string) {
  return sikpClient.post<Submission>(
    `${API_ENDPOINTS.SUBMISSION.GET_ALL_ADMIN}/${submissionId}/reject`,
    { reason },
    SubmissionSchema,
  );
}

/** Generate letter for approved submission. */
export async function generateSubmissionLetter(
  submissionId: string,
  format: "pdf" | "docx" = "pdf",
) {
  return sikpClient.post<GeneratedLetter>(
    `${API_ENDPOINTS.SUBMISSION.GET_ALL_ADMIN}/${submissionId}/generate-letter`,
    { format },
  );
}
