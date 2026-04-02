import { apiClient } from "~/lib/api-client";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
}

export interface DosenSuratPengantarRequestItem {
  id: string;
  requestId: string;
  submissionId: string;
  teamId?: string;
  teamCode?: string;
  nim?: string | null;
  namaMahasiswa?: string | null;
  programStudi?: string;
  angkatan?: string;
  semester?: string;
  email?: string;
  noHp?: string;
  tanggal?: string;
  status?: string;
  jenisSurat?: string;
  isAdminApproved?: boolean;
  adminVerificationStatus?: string;
  adminStatus?: string;
  admin_status?: string;
  submissionStatus?: string;
  submission_status?: string;
  companyName?: string;
  companyAddress?: string;
  recipientName?: string;
  destination?: string;
  tujuanSurat?: string;
  targetName?: string;
  division?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  memberCount?: number;
  approvedAt?: string;
  approved_at?: string;
  signedFileUrl?: string;
  signed_file_url?: string;
  finalSignedFileUrl?: string;
  final_signed_file_url?: string;
  nomorSurat?: string;
  letterNumber?: string;
}

export interface SubmissionDetailForVerifier {
  id: string;
  academicSupervisor?: string | null;
  academic_supervisor?: string | null;
  supervisorName?: string | null;
  supervisor_name?: string | null;
  supervisor?: {
    name?: string | null;
    fullName?: string | null;
  } | null;
  team?: {
    academicSupervisor?: string | null;
    academic_supervisor?: string | null;
    supervisorName?: string | null;
    supervisor_name?: string | null;
    supervisor?: {
      name?: string | null;
      fullName?: string | null;
    } | null;
    members?: Array<{
      role?: string;
      status?: string;
      userId?: string | null;
      name?: string | null;
      nim?: string | null;
      prodi?: string | null;
      user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        nim?: string | null;
        prodi?: string | null;
        angkatan?: string | null;
        semester?: string | null;
        noHp?: string | null;
        no_hp?: string | null;
        phone?: string | null;
      };
    }>;
  } | null;
}

export async function getDosenSuratPengantarRequests(): Promise<
  ApiResponse<DosenSuratPengantarRequestItem[]>
> {
  try {
    return await apiClient<DosenSuratPengantarRequestItem[]>(
      "/api/dosen/surat-pengantar/requests",
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat pengajuan surat pengantar",
      data: null,
    };
  }
}

export async function approveDosenSuratPengantarRequest(
  requestId: string,
): Promise<
  ApiResponse<{
    requestId: string;
    submissionId?: string;
    status: string;
    approvedAt?: string;
    approved_at?: string;
    signedFileUrl?: string;
    signed_file_url?: string;
    finalSignedFileUrl?: string;
    final_signed_file_url?: string;
  }>
> {
  try {
    return await apiClient(
      `/api/dosen/surat-pengantar/requests/${requestId}/approve`,
      {
        method: "PUT",
      },
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui surat pengantar",
      data: null,
    };
  }
}

export async function rejectDosenSuratPengantarRequest(
  requestId: string,
  reason: string,
): Promise<
  ApiResponse<{
    requestId: string;
    submissionId?: string;
    status: string;
    rejectedAt?: string;
    rejectionReason?: string;
  }>
> {
  try {
    return await apiClient(
      `/api/dosen/surat-pengantar/requests/${requestId}/reject`,
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
          : "Gagal menolak surat pengantar",
      data: null,
    };
  }
}

export async function getSubmissionDetailForVerifier(
  submissionId: string,
): Promise<ApiResponse<SubmissionDetailForVerifier>> {
  try {
    return await apiClient<SubmissionDetailForVerifier>(
      `/api/submissions/${submissionId}`,
    );
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal memuat detail submission",
      data: null,
    };
  }
}
