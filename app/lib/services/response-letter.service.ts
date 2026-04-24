import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Response Letter Service
 * Menangani semua operasi terkait surat balasan dari perusahaan.
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import type { Student } from "~/feature/response-letter/types";

// ==================== TYPES ====================

export interface ResponseLetterData {
  id: string;
  submissionId: string;
  originalName: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  memberUserId: string | null;
  letterStatus: "approved" | "rejected";
  submittedAt: string;
  verified: boolean;
  verifiedAt: string | null;
  verifiedByAdminId: string | null;
  isLeader?: boolean;
}

// ==================== API FUNCTIONS ====================

/**
 * Kirim surat balasan dari mahasiswa.
 * Endpoint: POST /api/response-letters
 */
export async function submitResponseLetter(data: {
  submissionId: string;
  teamId: string;
  file: File;
  letterStatus: "approved" | "rejected";
}): Promise<ApiResponse<ResponseLetterData>> {
  const formData = new FormData();
  formData.append("submissionId", data.submissionId);
  formData.append("file", data.file);
  formData.append("letterStatus", data.letterStatus);

  return sikpClient.upload<ResponseLetterData>(API_ENDPOINTS.RESPONSE_LETTER.CREATE, formData);
}

/**
 * Ambil semua response letters untuk admin.
 * Endpoint: GET /api/response-letters/admin
 * Hanya bisa diakses oleh role ADMIN.
 */
export async function getAllResponseLettersForAdmin(): Promise<
  ApiResponse<Student[]>
> {
  return sikpClient.get<Student[]>("/api/response-letters/admin");
}

/**
 * Verifikasi surat balasan oleh admin.
 * Endpoint: PUT /api/response-letters/admin/:id/verify
 */
export async function verifyResponseLetter(
  responseId: string,
  letterStatus: "approved" | "rejected",
): Promise<ApiResponse<{ id: string; verified: boolean; verifiedAt: string }>> {
  return sikpClient.put<{ id: string; verified: boolean; verifiedAt: string }>(
    `/api/response-letters/admin/${responseId}/verify`,
    { letterStatus },
  );
}

/**
 * Ambil detail response letter untuk preview.
 * Endpoint: GET /api/response-letters/:id
 */
export async function getResponseLetterDetail(
  responseId: string,
): Promise<ApiResponse<Student>> {
  return sikpClient.get<Student>(`/api/response-letters/${responseId}`);
}

/**
 * Ambil response letter milik mahasiswa yang sedang login.
 * Endpoint: GET /api/response-letters/my
 */
export async function getMyResponseLetter(): Promise<
  ApiResponse<ResponseLetterData>
> {
  return sikpClient.get<ResponseLetterData>("/api/response-letters/my");
}

/**
 * Ambil response letter berdasarkan submission ID.
 * Endpoint: GET /api/response-letters/submission/:submissionId
 */
export async function getResponseLetterBySubmission(
  submissionId: string,
): Promise<ApiResponse<ResponseLetterData>> {
  return sikpClient.get<ResponseLetterData>(
    `/api/response-letters/submission/${submissionId}`,
  );
}
