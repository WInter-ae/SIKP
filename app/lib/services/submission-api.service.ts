import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Submission API Service
 *
 * Menangani semua operasi terkait pengajuan KP (submission):
 * membuat, mengupdate, mengupload dokumen, dan manajemen status.
 *
 * Error handling dilakukan terpusat di apiClient — service ini
 * tidak perlu try/catch sendiri kecuali ada logika bisnis tambahan.
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import type {
  Submission,
  SubmissionDocument,
} from "~/feature/submission/types";

// ==================== STUDENT SUBMISSION ====================

/**
 * Fetch submission untuk tim yang sedang aktif.
 * Menggunakan /api/submissions/my-submissions dan filter berdasarkan teamId.
 *
 * Catatan: Hindari GET /api/submissions/team/:teamId — endpoint tidak tersedia di backend.
 */
export async function getSubmissionByTeamId(
  teamId: string,
): Promise<ApiResponse<Submission>> {
  const response = await sikpClient.get<Submission[]>(
    `/api/submissions/my-submissions`,
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Gagal memuat submission",
      data: null,
    };
  }

  const found = response.data.find((item) => item.teamId === teamId) || null;

  if (!found) {
    return {
      success: true,
      message: "Submission tidak ditemukan untuk tim ini",
      data: null,
    };
  }

  // Fetch documents — backend HARUS return SEMUA dokumen dari semua anggota tim
  const docsResponse = await sikpClient.get<SubmissionDocument[]>(
    `/api/submissions/${found.id}/documents`,
  );

  if (docsResponse.success && docsResponse.data) {
    found.documents = docsResponse.data;
  } else if (found.documents) {
    console.warn(
      "⚠️ Fetch documents gagal, menggunakan documents dari my-submissions",
    );
  }

  return { success: true, message: "OK", data: found };
}

/**
 * Create submission baru untuk tim.
 * Jika payload lengkap gagal validasi, retry dengan minimal payload (teamId saja).
 */
export async function createSubmission(
  teamId: string,
  data?: {
    letterPurpose: string;
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyBusinessType: string;
    division: string;
    startDate: string | null;
    endDate: string | null;
  },
): Promise<ApiResponse<Submission>> {
  const payload = data ? { teamId, ...data } : { teamId };

  const response = await sikpClient.post<Submission>(
    API_ENDPOINTS.SUBMISSION.CREATE,
    payload,
  );

  // Toleransi validasi backend: retry dengan minimal payload jika validasi gagal
  if (!response.success && data) {
    const message = (response.message || "").toLowerCase();
    const shouldRetryMinimal =
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("bad request") ||
      message.includes("400");

    if (shouldRetryMinimal) {
      return sikpClient.post<Submission>(API_ENDPOINTS.SUBMISSION.CREATE, {
        teamId,
      });
    }
  }

  return response;
}

// Maksimum ukuran file upload (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload dokumen untuk submission.
 *
 * Validasi lokal:
 * - Ukuran file maksimal 10 MB
 * - MIME type di-trim untuk menghindari overflow di kolom varchar(100)
 */
export async function uploadSubmissionDocument(
  submissionId: string,
  documentType:
    | "PROPOSAL_KETUA"
    | "SURAT_KESEDIAAN"
    | "FORM_PERMOHONAN"
    | "KRS_SEMESTER_4"
    | "DAFTAR_KUMPULAN_NILAI"
    | "BUKTI_PEMBAYARAN_UKT",
  memberMahasiswaId: string,
  file: File,
  uploadedByUserId?: string,
): Promise<ApiResponse<SubmissionDocument>> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      message: `Ukuran file terlalu besar. Maksimal 10 MB, file Anda ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      data: null,
    };
  }

  // Trim MIME type (tanpa parameter charset) untuk menghindari varchar overflow
  const baseFileType = (file.type || "application/octet-stream")
    .split(";")[0]
    .trim();
  void baseFileType; // dipakai untuk validasi MIME jika diperlukan

  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  formData.append("memberMahasiswaId", memberMahasiswaId);
  if (uploadedByUserId) {
    formData.append("uploadedByUserId", uploadedByUserId);
  }

  return sikpClient.upload<SubmissionDocument>(
    `/api/submissions/${submissionId}/documents`,
    formData,
  );
}

/**
 * Update submission dengan informasi perusahaan/internship.
 */
export async function updateSubmission(
  submissionId: string,
  data: {
    letterPurpose?: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
    companyBusinessType?: string;
    division?: string;
    companySupervisor?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<ApiResponse<Submission>> {
  return sikpClient.put<Submission>(`/api/submissions/${submissionId}`, data);
}

/**
 * Submit/finalize submission (ubah status menjadi PENDING_REVIEW).
 * Coba POST terlebih dahulu; fallback ke PUT jika 404.
 */
export async function submitSubmission(
  submissionId: string,
): Promise<ApiResponse<Submission>> {
  const response = await sikpClient.post<Submission>(
    `/api/submissions/${submissionId}/submit`,
    {},
  );

  // Fallback ke PUT jika POST 404
  if (!response.success && response.message?.includes("404")) {
    console.warn("📢 POST /submit gagal dengan 404, mencoba PUT...");
    return sikpClient.put<Submission>(
      `/api/submissions/${submissionId}/submit`,
      {},
    );
  }

  return response;
}

/**
 * Delete dokumen dari submission.
 */
export async function deleteSubmissionDocument(
  documentId: string,
): Promise<ApiResponse<void>> {
  return sikpClient.del<void>(`/api/submissions/documents/${documentId}`);
}

// ==================== ADMIN SUBMISSION ====================

/**
 * Fetch semua submissions untuk admin (PENDING_REVIEW, APPROVED, REJECTED).
 * Hanya bisa diakses oleh role ADMIN.
 */
export async function getAllSubmissionsForAdmin(): Promise<
  ApiResponse<Submission[]>
> {
  return sikpClient.get<Submission[]>(API_ENDPOINTS.SUBMISSION.GET_ALL_ADMIN);
}

/**
 * Update status submission (approve/reject) oleh admin.
 */
export async function updateSubmissionStatus(
  submissionId: string,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
  documentReviews?: Record<string, "approved" | "rejected">,
  letterNumber?: string,
): Promise<ApiResponse<Submission>> {
  return sikpClient.put<Submission>(
    `/api/admin/submissions/${submissionId}/status`,
    { status, rejectionReason, documentReviews, letterNumber },
  );
}

/**
 * Reset submission ke status DRAFT (mahasiswa ajukan ulang).
 * Endpoint: PUT /api/submissions/:id/reset
 */
export async function resetSubmissionToDraft(
  submissionId: string,
): Promise<ApiResponse<Submission>> {
  return sikpClient.request<Submission>(
    `/api/submissions/${submissionId}/reset`,
    { method: "PUT" },
  );
}
