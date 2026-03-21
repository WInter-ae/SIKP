import { apiClient } from "~/lib/api-client";

export interface SuratPermohonanRequestItem {
  id: string;
  submissionId?: string;
  tanggal: string;
  nim: string;
  namaMahasiswa: string;
  programStudi: string;
  angkatan?: string;
  semester?: string;
  jumlahSks?: string;
  tahunAjaran?: string;
  email?: string;
  noHp?: string;
  jenisSurat?: string;
  status: "menunggu" | "disetujui" | "ditolak";
  dosenNama: string;
  dosenNip: string;
  dosenJabatan?: string;
  dosenEsignatureUrl?: string;
  dosen_esignature_url?: string;
  mahasiswaEsignatureUrl?: string;
  mahasiswa_esignature_url?: string;
  signedFileUrl?: string;
  signed_file_url?: string;
  approvedAt?: string;
  approved_at?: string;
  // Submission / company data
  namaPerusahaan?: string;
  alamatPerusahaan?: string;
  teleponPerusahaan?: string;
  jenisProdukUsaha?: string;
  divisi?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  // Workflow fields (opsional untuk kompatibilitas backend lama)
  isAdminApproved?: boolean;
  adminVerificationStatus?: string;
  admin_status?: string;
  adminStatus?: string;
  submissionStatus?: string;
  submission_status?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
}

export async function requestSuratPermohonanApproval(
  memberUserId: string,
  mahasiswaEsignatureUrl?: string,
): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const bodyPayload: Record<string, string> = { memberUserId };
    if (mahasiswaEsignatureUrl) {
      bodyPayload.mahasiswaEsignatureUrl = mahasiswaEsignatureUrl;
      bodyPayload.mahasiswa_esignature_url = mahasiswaEsignatureUrl;
    }

    const body = JSON.stringify(bodyPayload);

    // Backward-compatible fallback list: backend route may vary by deployment.
    const endpoints = [
      "/api/mahasiswa/surat-permohonan/requests",
      "/api/mahasiswa/surat-permohonan/request",
      "/api/surat-permohonan/requests",
      "/api/surat-permohonan/request",
    ];

    for (const endpoint of endpoints) {
      const response = await apiClient<{ requestId: string }>(endpoint, {
        method: "POST",
        body,
      });

      if (response.success) return response;

      const message = response.message?.toLowerCase() || "";
      const isNotFound =
        message.includes("404") ||
        message.includes("not found") ||
        message.includes("cannot post") ||
        message.includes("route") ||
        message.includes("endpoint");
      if (!isNotFound) return response;
    }

    return {
      success: false,
      message: "Endpoint pengajuan surat permohonan tidak ditemukan",
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengajukan surat permohonan",
      data: null,
    };
  }
}

export async function reapplySuratPermohonanApproval(
  requestId: string,
  memberUserId: string,
  mahasiswaEsignatureUrl?: string,
): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const bodyPayload: Record<string, string> = { requestId, memberUserId };
    if (mahasiswaEsignatureUrl) {
      bodyPayload.mahasiswaEsignatureUrl = mahasiswaEsignatureUrl;
      bodyPayload.mahasiswa_esignature_url = mahasiswaEsignatureUrl;
    }

    const jsonBody = JSON.stringify(bodyPayload);

    // Be tolerant with backend route/method variations across deployments.
    const endpointCandidates = [
      `/api/mahasiswa/surat-permohonan/requests/${requestId}/reapply`,
      `/api/mahasiswa/surat-permohonan/requests/${requestId}/resubmit`,
      `/api/mahasiswa/surat-permohonan/request/${requestId}/reapply`,
      `/api/mahasiswa/surat-permohonan/request/${requestId}/resubmit`,
      `/api/mahasiswa/surat-permohonan/requests/${requestId}`,
      `/api/mahasiswa/surat-permohonan/request/${requestId}`,
      "/api/mahasiswa/surat-permohonan/requests/reapply",
      "/api/mahasiswa/surat-permohonan/requests/resubmit",
      `/api/surat-permohonan/requests/${requestId}/reapply`,
      `/api/surat-permohonan/requests/${requestId}/resubmit`,
      `/api/surat-permohonan/request/${requestId}/reapply`,
      `/api/surat-permohonan/request/${requestId}/resubmit`,
      `/api/surat-permohonan/requests/${requestId}`,
      `/api/surat-permohonan/request/${requestId}`,
      "/api/surat-permohonan/requests/reapply",
      "/api/surat-permohonan/requests/resubmit",
    ];

    const methods: Array<"PUT" | "PATCH" | "POST"> = ["PUT", "PATCH", "POST"];

    for (const endpoint of endpointCandidates) {
      for (const method of methods) {
        const response = await apiClient<{ requestId: string }>(endpoint, {
          method,
          body: jsonBody,
        });

        if (response.success) return response;

        const message = response.message?.toLowerCase() || "";
        const isRouteOrMethodIssue =
          message.includes("404") ||
          message.includes("not found") ||
          message.includes("cannot put") ||
          message.includes("cannot patch") ||
          message.includes("cannot post") ||
          message.includes("method not allowed") ||
          message.includes("route") ||
          message.includes("endpoint");

        if (!isRouteOrMethodIssue) return response;
      }
    }

    return {
      success: false,
      message: "Endpoint ajukan ulang surat permohonan tidak ditemukan",
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengajukan ulang surat permohonan",
      data: null,
    };
  }
}

export async function getDosenSuratPermohonanRequests(): Promise<
  ApiResponse<SuratPermohonanRequestItem[]>
> {
  try {
    return await apiClient<SuratPermohonanRequestItem[]>(
      "/api/dosen/surat-permohonan/requests",
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat pengajuan surat permohonan",
      data: null,
    };
  }
}

export async function approveDosenSuratPermohonanRequest(
  requestId: string,
  options?: {
    mahasiswaEsignatureUrl?: string;
    mahasiswa_esignature_url?: string;
  },
): Promise<
  ApiResponse<{
    requestId: string;
    status: string;
    approvedAt?: string;
    approved_at?: string;
    signedFileUrl?: string;
    signed_file_url?: string;
  }>
> {
  try {
    const payload: Record<string, string> = {};
    const signatureUrl =
      options?.mahasiswaEsignatureUrl || options?.mahasiswa_esignature_url;
    if (signatureUrl) {
      payload.mahasiswaEsignatureUrl = signatureUrl;
      payload.mahasiswa_esignature_url = signatureUrl;
    }

    return await apiClient(
      `/api/dosen/surat-permohonan/requests/${requestId}/approve`,
      {
        method: "PUT",
        body: Object.keys(payload).length > 0 ? JSON.stringify(payload) : undefined,
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui surat permohonan",
      data: null,
    };
  }
}

export async function rejectDosenSuratPermohonanRequest(
  requestId: string,
  reason: string,
): Promise<
  ApiResponse<{
    requestId: string;
    status: string;
    rejectedAt?: string;
    rejected_at?: string;
    rejectionReason?: string;
    rejection_reason?: string;
  }>
> {
  try {
    return await apiClient(
      `/api/dosen/surat-permohonan/requests/${requestId}/reject`,
      {
        method: "PUT",
        body: JSON.stringify({ rejection_reason: reason }),
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menolak surat permohonan",
      data: null,
    };
  }
}

export async function approveBulkDosenSuratPermohonanRequests(
  requestIds: string[],
  options?: {
    signatures?: Array<{
      requestId: string;
      mahasiswaEsignatureUrl: string;
    }>;
  },
): Promise<
  ApiResponse<{
    approvedCount?: number;
    failed?: Array<{ requestId: string; reason: string }>;
  }>
> {
  try {
    const payload: Record<string, unknown> = { requestIds };
    if (options?.signatures && options.signatures.length > 0) {
      payload.signatures = options.signatures.map((item) => ({
        requestId: item.requestId,
        mahasiswaEsignatureUrl: item.mahasiswaEsignatureUrl,
        mahasiswa_esignature_url: item.mahasiswaEsignatureUrl,
      }));
    }

    return await apiClient(
      "/api/dosen/surat-permohonan/requests/approve-bulk",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui surat permohonan terpilih",
      data: null,
    };
  }
}
