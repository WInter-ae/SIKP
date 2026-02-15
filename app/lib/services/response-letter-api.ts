import { apiClient } from "~/lib/api-client";
import type { Student } from "~/feature/response-letter/types";

/**
 * Response Letter API Service
 * Menangani semua komunikasi dengan backend terkait surat balasan (response letter)
 */

/**
 * Kirim surat balasan dari mahasiswa (POST /api/response-letters)
 * Dipanggil ketika mahasiswa submit surat balasan di response-letter-page
 * Backend memerlukan submissionId, file, dan letterStatus
 */
export async function submitResponseLetter(data: {
  submissionId: string;
  teamId: string;
  file: File;
  letterStatus: "approved" | "rejected";
}) {
  try {
    const formData = new FormData();
    formData.append("submissionId", data.submissionId);
    // teamId diambil dari submission
    formData.append("file", data.file);
    formData.append("letterStatus", data.letterStatus);

    const response = await apiClient<{
      id: string;
      submissionId: string;
      originalName: string | null;
      fileName: string | null;
      fileType: string | null;
      fileSize: number | null;
      fileUrl: string | null;
      memberUserId: string | null;
      letterStatus: string;
      submittedAt: string;
      verified: boolean;
      verifiedAt: string | null;
      verifiedByAdminId: string | null;
    }>("/api/response-letters", {
      method: "POST",
      body: formData,
    });

    return response;
  } catch (error) {
    console.error("❌ Error submitting response letter:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal mengirim surat balasan",
      data: null,
    };
  }
}

/**
 * Ambil semua response letters untuk admin (GET /api/response-letters/admin)
 * Dipanggil ketika admin membuka admin-response-letter-page
 * Hanya bisa diakses oleh role ADMIN
 */
export async function getAllResponseLettersForAdmin() {
  try {
    const response = await apiClient<Student[]>("/api/response-letters/admin");
    return response;
  } catch (error) {
    console.error("❌ Error fetching response letters:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat daftar surat balasan",
      data: null,
    };
  }
}

/**
 * Verifikasi surat balasan oleh admin (PUT /api/response-letters/admin/:id/verify)
 * Admin dapat memverifikasi/menyetujui surat balasan yang sudah dikirim mahasiswa
 * Backend memerlukan letterStatus dalam request body
 */
export async function verifyResponseLetter(
  responseId: string,
  letterStatus: "approved" | "rejected",
) {
  try {
    const response = await apiClient<{
      id: string;
      verified: boolean;
      verifiedAt: string;
    }>(`/api/response-letters/admin/${responseId}/verify`, {
      method: "PUT",
      body: JSON.stringify({
        letterStatus,
      }),
    });

    return response;
  } catch (error) {
    console.error("❌ Error verifying response letter:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memverifikasi surat balasan",
      data: null,
    };
  }
}

/**
 * Ambil detail response letter untuk preview (GET /api/response-letters/:id)
 * Bisa diakses oleh mahasiswa atau admin
 */
export async function getResponseLetterDetail(responseId: string) {
  try {
    const response = await apiClient<Student>(
      `/api/response-letters/${responseId}`,
    );
    return response;
  } catch (error) {
    console.error("❌ Error fetching response letter detail:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat detail surat balasan",
      data: null,
    };
  }
}

/**
 * Ambil response letter milik mahasiswa yang sedang login (GET /api/response-letters/my)
 * Dipanggil ketika mahasiswa membuka response-letter-page untuk load existing data
 * Mengembalikan data response letter jika sudah pernah submit
 */
export async function getMyResponseLetter() {
  try {
    const response = await apiClient<{
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
    }>("/api/response-letters/my");
    return response;
  } catch (error) {
    console.error("❌ Error fetching my response letter:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat data surat balasan",
      data: null,
    };
  }
}

/**
 * Ambil response letter berdasarkan submission ID
 * Digunakan untuk mendapatkan data surat balasan untuk seluruh tim
 */
export async function getResponseLetterBySubmission(submissionId: string) {
  try {
    const response = await apiClient<{
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
    }>(`/api/response-letters/submission/${submissionId}`);
    return response;
  } catch (error) {
    console.error("❌ Error fetching response letter by submission:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat data surat balasan",
      data: null,
    };
  }
}
