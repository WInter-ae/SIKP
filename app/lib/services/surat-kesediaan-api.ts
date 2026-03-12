import { apiClient } from "~/lib/api-client";

export interface SuratKesediaanRequestItem {
  id: string;
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
  signedFileUrl?: string;
  signed_file_url?: string;
  approvedAt?: string;
  approved_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
}

export async function requestSuratKesediaanApproval(
  memberUserId: string,
): Promise<ApiResponse<{ requestId: string }>> {
  try {
    const body = JSON.stringify({ memberUserId });

    // Backward-compatible fallback list: backend route may vary by deployment.
    const endpoints = [
      "/api/mahasiswa/surat-kesediaan/requests",
      "/api/surat-kesediaan/requests",
      "/api/surat-kesediaan/request",
    ];

    for (const endpoint of endpoints) {
      const response = await apiClient<{ requestId: string }>(endpoint, {
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
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengajukan surat kesediaan",
      data: null,
    };
  }
}

export async function getDosenSuratKesediaanRequests(): Promise<
  ApiResponse<SuratKesediaanRequestItem[]>
> {
  try {
    return await apiClient<SuratKesediaanRequestItem[]>(
      "/api/dosen/surat-kesediaan/requests",
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat pengajuan surat kesediaan",
      data: null,
    };
  }
}

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
  try {
    return await apiClient<{
      requestId: string;
      status: "DISETUJUI" | "REJECTED" | string;
      approvedAt?: string;
      approved_at?: string;
      signedFileUrl?: string;
      signed_file_url?: string;
    }>(`/api/dosen/surat-kesediaan/requests/${requestId}/approve`, {
      method: "PUT",
    });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui surat kesediaan",
      data: null,
    };
  }
}

export async function approveBulkDosenSuratKesediaanRequests(
  requestIds: string[],
): Promise<
  ApiResponse<{
    approvedCount?: number;
    failed?: Array<{ requestId: string; reason: string }>;
  }>
> {
  try {
    return await apiClient<{
      approvedCount?: number;
      failed?: Array<{ requestId: string; reason: string }>;
    }>("/api/dosen/surat-kesediaan/requests/approve-bulk", {
      method: "PUT",
      body: JSON.stringify({ requestIds }),
    });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui surat kesediaan terpilih",
      data: null,
    };
  }
}
