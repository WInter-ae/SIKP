import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Dosen Profile & E-Signature Service
 * Menangani manajemen profil dosen dan e-signature via SSO.
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import {
  dataUrlToFile as dataUrlToFileFromSignatureApi,
  getSignatureManageUrl,
} from "~/lib/services/signature.service";

// ==================== TYPES ====================

export interface DosenProfile {
  id: string;
  nip: string;
  nama: string;
  email: string;
  telepon: string;
  jabatan: string;
  fakultas: string;
  programStudi: string;
  esignature?: {
    url: string;
    key: string;
    uploadedAt: string;
  };
}

export interface ESignatureUploadResponse {
  url: string;
  key: string;
  uploadedAt: string;
}

export interface DosenDashboardData {
  totalMahasiswaBimbingan: number;
  totalSuratAjuanMasuk: number;
  activities: Array<{
    action: string;
    time: string;
    status: "success" | "info";
  }>;
}

export interface WakdekDashboardData {
  totalAjuanSuratPengantarMasuk: number;
  activities: Array<{
    action: string;
    time: string;
    status: "success" | "info";
  }>;
}

// ==================== API FUNCTIONS ====================

/**
 * Get current dosen profile (authenticated user).
 * Endpoint: GET /api/dosen/me
 */
export async function getMyProfile(): Promise<ApiResponse<DosenProfile>> {
  return sikpClient.get<DosenProfile>(API_ENDPOINTS.DOSEN.GET_MY_PROFILE);
}

/**
 * Get dosen dashboard data.
 * Endpoint: GET /api/dosen/dashboard
 */
export async function getDosenDashboard(): Promise<
  ApiResponse<DosenDashboardData>
> {
  return sikpClient.get<DosenDashboardData>("/api/dosen/dashboard");
}

/**
 * Get wakil dekan dashboard data.
 * Endpoint: GET /api/dosen/dashboard/wakdek
 */
export async function getWakdekDashboard(): Promise<
  ApiResponse<WakdekDashboardData>
> {
  return sikpClient.get<WakdekDashboardData>("/api/dosen/dashboard/wakdek");
}

/**
 * Update dosen profile.
 * Endpoint: PUT /api/dosen/me/profile
 */
export async function updateMyProfile(profileData: {
  nama?: string;
  email?: string;
  telepon?: string;
  jabatan?: string;
  fakultas?: string;
  programStudi?: string;
}): Promise<ApiResponse<DosenProfile>> {
  return sikpClient.put<DosenProfile>("/api/dosen/me/profile", profileData);
}

/**
 * Upload atau ganti e-signature dosen.
 * Manajemen signature dilakukan di SSO — endpoint ini mengembalikan URL SSO.
 */
export async function uploadESignature(
  signatureFile: File,
): Promise<ApiResponse<ESignatureUploadResponse>> {
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (signatureFile.size > maxSize) {
    return {
      success: false,
      message: "File terlalu besar (maksimal 2MB)",
      data: null,
    };
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(signatureFile.type)) {
    return {
      success: false,
      message: "Format file tidak valid (hanya PNG/JPG/JPEG)",
      data: null,
    };
  }

  const manageUrlResponse = await getSignatureManageUrl();
  if (!manageUrlResponse.success || !manageUrlResponse.data) {
    return {
      success: false,
      message:
        manageUrlResponse.message || "Kelola e-signature hanya tersedia di SSO.",
      data: null,
    };
  }

  return {
    success: false,
    message: `Kelola e-signature di SSO: ${manageUrlResponse.data}`,
    data: null,
  };
}

/**
 * Hapus e-signature dosen.
 * Manajemen signature dilakukan di SSO.
 */
export async function deleteESignature(): Promise<ApiResponse<null>> {
  const manageUrlResponse = await getSignatureManageUrl();
  if (!manageUrlResponse.success || !manageUrlResponse.data) {
    return {
      success: false,
      message:
        manageUrlResponse.message || "Kelola e-signature hanya tersedia di SSO.",
      data: null,
    };
  }

  return {
    success: false,
    message: `Kelola e-signature di SSO: ${manageUrlResponse.data}`,
    data: null,
  };
}

/**
 * Helper: Convert Data URL (dari canvas) ke File.
 */
export async function dataUrlToFile(
  dataUrl: string,
  filename?: string,
): Promise<File> {
  const finalFilename = filename || `signature-${Date.now()}.png`;
  return dataUrlToFileFromSignatureApi(dataUrl, finalFilename);
}
