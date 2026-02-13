import { apiClient } from "~/lib/api-client";
import type { Student } from "~/feature/response-letter/types";

/**
 * Response Letter API Service
 * Menangani semua komunikasi dengan backend terkait surat balasan (response letter)
 */

/**
 * Kirim surat balasan dari mahasiswa (POST /api/response-letters)
 * Dipanggil ketika mahasiswa submit surat balasan di response-letter-page
 * Backend hanya memerlukan submissionId dan file
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
    // Backend doesn't need teamId and letterStatus
    // teamId diambil dari submission, letterStatus default to 'approved'
    formData.append("file", data.file);

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
 * Backend hanya memerlukan letterStatus dalam request body
 */
export async function verifyResponseLetter(responseId: string) {
  try {
    const response = await apiClient<{
      id: string;
      verified: boolean;
      verifiedAt: string;
    }>(`/api/response-letters/admin/${responseId}/verify`, {
      method: "PUT",
      body: JSON.stringify({
        letterStatus: "approved",
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
