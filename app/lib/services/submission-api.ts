import { apiClient } from "~/lib/api-client";
import { getAuthToken } from "~/lib/auth-client";
import type { Submission, SubmissionDocument } from "~/feature/submission/types";

/**
 * Fetch submission untuk tim yang sedang aktif
 * Termasuk fetch documents dari endpoint terpisah
 *
 * Endpoint /api/submissions/:id/documents harus return SEMUA dokumen
 * dari semua anggota tim, bukan hanya dokumen auth user
 *
 * Strategy:
 * - Gunakan /api/submissions/my-submissions untuk mendapatkan submission milik user
 * - Filter berdasarkan teamId untuk menemukan submission yang sesuai
 * - Fetch documents dengan submissionId yang sudah ditemukan
 * 
 * Per Frontend Integration Guide: Hindari memanggil GET /api/submissions/team/:teamId
 * karena endpoint tersebut tidak tersedia di backend.
 */
export async function getSubmissionByTeamId(teamId: string) {
  try {
    // Gunakan my-submissions dan filter by teamId
    const response = await apiClient<Submission[]>(`/api/submissions/my-submissions`);

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

    // Fetch documents untuk submission ini
    // Backend HARUS return SEMUA dokumen dari semua anggota, bukan hanya auth user
    const docsResponse = await apiClient<SubmissionDocument[]>(
      `/api/submissions/${found.id}/documents`
    );

    if (docsResponse.success && docsResponse.data) {
      // Jika backend return dokumen, gunakan itu (harus all docs)
      found.documents = docsResponse.data;
    } else if (found.documents) {
      // Fallback: jika found.documents sudah ada dari response my-submissions, gunakan itu
      console.warn(
        "⚠️ Fetch documents failed, menggunakan documents dari my-submissions"
      );
    }

    return {
      success: true,
      message: "OK",
      data: found,
    };
  } catch (error) {
    console.error("❌ Error fetching submission:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memuat submission",
      data: null,
    };
  }
}

/**
 * Create submission baru untuk tim
 */
export async function createSubmission(
  teamId: string,
  data: {
    letterPurpose: string;
    companyName: string;
    companyAddress: string;
    division: string;
    companySupervisor: string;
    startDate: string;
    endDate: string;
  }
) {
  try {
    const response = await apiClient<Submission>("/api/submissions", {
      method: "POST",
      body: JSON.stringify({
        teamId,
        ...data,
      }),
    });
    return response;
  } catch (error) {
    console.error("❌ Error creating submission:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal membuat submission",
      data: null,
    };
  }
}

// Maksimum ukuran file upload (10 MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Upload dokumen untuk submission
 * Menggunakan multipart form data untuk file
 * 
 * Validasi:
 * - Ukuran file maksimal 10 MB
 * - MIME type di-trim untuk menghindari overflow di kolom varchar(100)
 * - uploadedByUserId wajib ada (fallback ke memberUserId jika tidak dikirim)
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
  memberUserId: string,
  file: File,
  uploadedByUserId?: string,
) {
  try {
    // Validasi ukuran file (maksimal 10 MB)
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: `Ukuran file terlalu besar. Maksimal 10 MB, file Anda ${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        data: null,
      };
    }

    // Ekstrak MIME type murni (tanpa parameter charset) untuk menghindari varchar overflow
    const baseFileType = (file.type || "application/octet-stream")
      .split(";")[0]
      .trim();

    const formData = new FormData();
    // Backend expects camelCase fields for validation
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("memberUserId", memberUserId);
    // Optional: uploadedByUserId akan di-fallback ke auth user di backend jika tidak dikirim
    if (uploadedByUserId) {
      formData.append("uploadedByUserId", uploadedByUserId);
    }

    // Gunakan apiClient yang sudah handle FormData dengan benar
    const response = await apiClient<SubmissionDocument>(
      `/api/submissions/${submissionId}/documents`,
      {
        method: "POST",
        body: formData,
      }
    );

    return response;
  } catch (error) {
    console.error("❌ Error uploading document:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengupload dokumen",
      data: null,
    };
  }
}

/**
 * Update submission dengan informasi perusahaan/internship
 */
export async function updateSubmission(
  submissionId: string,
  data: {
    letterPurpose?: string;
    companyName?: string;
    companyAddress?: string;
    division?: string;
    companySupervisor?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  try {
    const response = await apiClient<Submission>(
      `/api/submissions/${submissionId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    return response;
  } catch (error) {
    console.error("❌ Error updating submission:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal memperbarui submission",
      data: null,
    };
  }
}

/**
 * Submit/finalize submission (ubah status menjadi PENDING_REVIEW)
 */
export async function submitSubmission(submissionId: string) {
  try {
    const response = await apiClient<Submission>(
      `/api/submissions/${submissionId}/submit`,
      {
        method: "PUT",
        body: JSON.stringify({}),
      }
    );
    return response;
  } catch (error) {
    console.error("❌ Error submitting submission:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal mengajukan submission",
      data: null,
    };
  }
}

/**
 * Delete dokumen dari submission
 */
export async function deleteSubmissionDocument(documentId: string) {
  try {
    const response = await apiClient<void>(`/api/submissions/documents/${documentId}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("❌ Error deleting document:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghapus dokumen",
      data: null,
    };
  }
}
