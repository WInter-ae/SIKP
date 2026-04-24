import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Surat Kesediaan Service
 * Menangani pengajuan dan persetujuan surat kesediaan dosen pembimbing.
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

// ==================== TYPES ====================

export interface SuratKesediaanRequestItem {
  id: string;
  submissionId?: string;
  tanggal: string;
  nim: string;
  namaMahasiswa: string;
  programStudi: string;
  angkatan?: string;
  semester?: string;
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
  signedFileUrl?: string;
  signed_file_url?: string;
  approvedAt?: string;
  approved_at?: string;
  isAdminApproved?: boolean;
  adminVerificationStatus?: string;
  admin_status?: string;
  adminStatus?: string;
  submissionStatus?: string;
  submission_status?: string;
}

// ==================== MAHASISWA FUNCTIONS ====================

/**
 * Ajukan surat kesediaan — mahasiswa meminta persetujuan dosen.
 * Mencoba beberapa endpoint secara berurutan untuk kompatibilitas backend.
 */
export async function requestSuratKesediaanApproval(
  memberUserId: string,
): Promise<ApiResponse<{ requestId: string }>> {
  const body = JSON.stringify({ memberUserId });

  const endpoints = [
    "/api/mahasiswa/surat-kesediaan/requests",
    "/api/surat-kesediaan/requests",
    "/api/surat-kesediaan/request",
  ];

  for (const endpoint of endpoints) {
    const response = await sikpClient.request<{ requestId: string }>(endpoint, {
      method: "POST",
      body,
    });

    if (response.success) return response;

    const message = response.message?.toLowerCase() || "";
    const isNotFound =
      message.includes("404") || message.includes("not found");
    if (!isNotFound) return response;
  }

  return {
    success: false,
    message: "Endpoint pengajuan surat kesediaan tidak ditemukan",
    data: null,
  };
}

/**
 * Ajukan ulang surat kesediaan setelah ditolak.
 */
export async function reapplySuratKesediaanApproval(
  requestId: string,
  memberUserId: string,
): Promise<ApiResponse<{ requestId: string }>> {
  return sikpClient.put<{ requestId: string }>(
    `/api/mahasiswa/surat-kesediaan/requests/${requestId}/reapply`,
    { memberUserId },
  );
}

// ==================== DOSEN FUNCTIONS ====================

/**
 * Ambil semua pengajuan surat kesediaan untuk dosen yang login.
 * Endpoint: GET /api/dosen/surat-kesediaan/requests
 */
export async function getDosenSuratKesediaanRequests(): Promise<
  ApiResponse<SuratKesediaanRequestItem[]>
> {
  return sikpClient.get<SuratKesediaanRequestItem[]>(
    API_ENDPOINTS.SURAT_KESEDIAAN.DOSEN_GET_REQUESTS,
  );
}

/**
 * Setujui pengajuan surat kesediaan.
 * Endpoint: PUT /api/dosen/surat-kesediaan/requests/:id/approve
 */
export async function approveDosenSuratKesediaanRequest(
  requestId: string,
): Promise<
  ApiResponse<{
    requestId: string;
    status: "DISETUJUI" | "REJECTED" | string;
    approvedAt?: string;
    approved_at?: string;
    signedFileUrl?: string;
    signed_file_url?: string;
  }>
> {
  return sikpClient.put(
    `/api/dosen/surat-kesediaan/requests/${requestId}/approve`,
  );
}

/**
 * Tolak pengajuan surat kesediaan.
 * Endpoint: PUT /api/dosen/surat-kesediaan/requests/:id/reject
 */
export async function rejectDosenSuratKesediaanRequest(
  requestId: string,
  reason: string,
): Promise<
  ApiResponse<{
    requestId: string;
    status: "DITOLAK" | "REJECTED" | string;
    rejectedAt?: string;
    rejected_at?: string;
    rejectionReason?: string;
    rejection_reason?: string;
  }>
> {
  return sikpClient.put(
    `/api/dosen/surat-kesediaan/requests/${requestId}/reject`,
    { rejection_reason: reason },
  );
}

/**
 * Setujui beberapa pengajuan surat kesediaan sekaligus.
 * Endpoint: PUT /api/dosen/surat-kesediaan/requests/approve-bulk
 */
export async function approveBulkDosenSuratKesediaanRequests(
  requestIds: string[],
): Promise<
  ApiResponse<{
    approvedCount?: number;
    failed?: Array<{ requestId: string; reason: string }>;
  }>
> {
  return sikpClient.put(
    API_ENDPOINTS.SURAT_KESEDIAAN.DOSEN_APPROVE_BULK,
    { requestIds },
  );
}
