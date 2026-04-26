import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Surat Permohonan Service
 * Menangani pengajuan dan persetujuan surat permohonan (Form Permohonan KP).
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

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
  supervisor?: string;
  academicSupervisor?: string;
  academic_supervisor?: string;
  supervisorName?: string;
  supervisor_name?: string;
  teamMembers?: Array<{
    id?: string;
    userId?: string;
    name?: string;
    nim?: string;
    prodi?: string;
    role?: string;
    user?: {
      id?: string;
      name?: string;
      nim?: string;
      prodi?: string;
    };
  }>;
  mahasiswaEsignatureUrl?: string;
  mahasiswa_esignature_url?: string;
  signedFileUrl?: string;
  signed_file_url?: string;
  approvedAt?: string;
  approved_at?: string;
  namaPerusahaan?: string;
  alamatPerusahaan?: string;
  teleponPerusahaan?: string;
  jenisProdukUsaha?: string;
  divisi?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  isAdminApproved?: boolean;
  adminVerificationStatus?: string;
  admin_status?: string;
  adminStatus?: string;
  submissionStatus?: string;
  submission_status?: string;
}

// ==================== MAHASISWA FUNCTIONS ====================

/**
 * Ajukan surat permohonan — mahasiswa meminta persetujuan dosen.
 * Mencoba beberapa endpoint untuk kompatibilitas backend.
 */
export async function requestSuratPermohonanApproval(
  memberMahasiswaId: string,
  mahasiswaEsignatureUrl?: string,
): Promise<ApiResponse<{ requestId: string }>> {
  const bodyPayload: Record<string, string> = { memberMahasiswaId };
  if (mahasiswaEsignatureUrl) {
    bodyPayload.mahasiswaEsignatureUrl = mahasiswaEsignatureUrl;
    bodyPayload.mahasiswa_esignature_url = mahasiswaEsignatureUrl;
  }

  const body = JSON.stringify(bodyPayload);

  const endpoints = [
    API_ENDPOINTS.SURAT_PERMOHONAN.DOSEN_GET_REQUESTS,
    "/api/mahasiswa/surat-permohonan/request",
    "/api/surat-permohonan/requests",
    "/api/surat-permohonan/request",
  ];

  for (const endpoint of endpoints) {
    const response = await sikpClient.request<{ requestId: string }>(endpoint, {
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
}

/**
 * Ajukan ulang surat permohonan setelah ditolak.
 * Mencoba berbagai endpoint dan method untuk kompatibilitas backend.
 */
export async function reapplySuratPermohonanApproval(
  requestId: string,
  memberMahasiswaId: string,
  mahasiswaEsignatureUrl?: string,
): Promise<ApiResponse<{ requestId: string }>> {
  const bodyPayload: Record<string, string> = { requestId, memberMahasiswaId };
  if (mahasiswaEsignatureUrl) {
    bodyPayload.mahasiswaEsignatureUrl = mahasiswaEsignatureUrl;
    bodyPayload.mahasiswa_esignature_url = mahasiswaEsignatureUrl;
  }

  const jsonBody = JSON.stringify(bodyPayload);

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
      const response = await sikpClient.request<{ requestId: string }>(
        endpoint,
        { method, body: jsonBody },
      );

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
}

// ==================== DOSEN FUNCTIONS ====================

/**
 * Ambil semua pengajuan surat permohonan untuk dosen yang login.
 * Endpoint: GET /api/dosen/surat-permohonan/requests
 */
export async function getDosenSuratPermohonanRequests(): Promise<
  ApiResponse<SuratPermohonanRequestItem[]>
> {
  return sikpClient.get<SuratPermohonanRequestItem[]>(
    API_ENDPOINTS.SURAT_PERMOHONAN.DOSEN_GET_REQUESTS,
  );
}

/**
 * Setujui pengajuan surat permohonan.
 * Endpoint: PUT /api/dosen/surat-permohonan/requests/:id/approve
 */
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
  const payload: Record<string, string> = {};
  const signatureUrl =
    options?.mahasiswaEsignatureUrl || options?.mahasiswa_esignature_url;
  if (signatureUrl) {
    payload.mahasiswaEsignatureUrl = signatureUrl;
    payload.mahasiswa_esignature_url = signatureUrl;
  }

  return sikpClient.put(
    `/api/dosen/surat-permohonan/requests/${requestId}/approve`,
    Object.keys(payload).length > 0 ? payload : undefined,
  );
}

/**
 * Tolak pengajuan surat permohonan.
 * Endpoint: PUT /api/dosen/surat-permohonan/requests/:id/reject
 */
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
  return sikpClient.put(
    `/api/dosen/surat-permohonan/requests/${requestId}/reject`,
    { rejection_reason: reason },
  );
}

/**
 * Setujui beberapa pengajuan surat permohonan sekaligus.
 * Endpoint: PUT /api/dosen/surat-permohonan/requests/approve-bulk
 */
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
  const payload: Record<string, unknown> = { requestIds };
  if (options?.signatures && options.signatures.length > 0) {
    payload.signatures = options.signatures.map((item) => ({
      requestId: item.requestId,
      mahasiswaEsignatureUrl: item.mahasiswaEsignatureUrl,
      mahasiswa_esignature_url: item.mahasiswaEsignatureUrl,
    }));
  }

  return sikpClient.put(
    API_ENDPOINTS.SURAT_PERMOHONAN.DOSEN_APPROVE_BULK,
    payload,
  );
}
