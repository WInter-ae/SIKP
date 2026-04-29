import { API_ENDPOINTS } from "~/lib/constants/endpoints";
/**
 * Mahasiswa Profile & E-Signature Service
 * Menangani manajemen profil mahasiswa dan e-signature via SSO.
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import {
  dataUrlToFile as dataUrlToFileFromSignatureApi,
  getSignatureManageUrl,
} from "~/lib/services/signature.service";

// ==================== TYPES ====================

export interface MahasiswaProfile {
  id: string;
  nim: string;
  nama: string | null;
  email: string;
  phone: string | null;
  fakultas: string | null;
  prodi: string | null;
  semester: number | null;
  jumlahSksSelesai: number | null;
  angkatan: string | null;
  esignature: {
    url: string;
    key: string | null;
    uploadedAt: string | null;
  } | null;
}

export interface ESignatureUploadResponse {
  url: string;
  key: string;
  uploadedAt: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Get current mahasiswa profile (authenticated user).
 * Endpoint: GET /api/mahasiswa/me
 */
export async function getMyMahasiswaProfile(): Promise<
  ApiResponse<MahasiswaProfile>
> {
  return sikpClient.get<MahasiswaProfile>(
    API_ENDPOINTS.MAHASISWA.GET_MY_PROFILE,
  );
}

/**
 * Update mahasiswa profile.
 * Endpoint: PUT /api/mahasiswa/me/profile
 */
export async function updateMyMahasiswaProfile(profileData: {
  nama?: string;
  email?: string;
  phone?: string;
  fakultas?: string | null;
  prodi?: string | null;
  semester?: number | null;
  jumlahSksSelesai?: number | null;
  angkatan?: string | null;
}): Promise<ApiResponse<MahasiswaProfile>> {
  return sikpClient.put<MahasiswaProfile>(
    "/api/mahasiswa/me/profile",
    profileData,
  );
}

/**
 * Upload atau ganti e-signature mahasiswa.
 * Manajemen signature dilakukan di SSO.
 */
export async function uploadMahasiswaESignature(
  signatureFile: File,
): Promise<ApiResponse<ESignatureUploadResponse>> {
  const maxSize = 2 * 1024 * 1024;
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
        manageUrlResponse.message ||
        "Kelola e-signature hanya tersedia di SSO.",
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
 * Hapus e-signature mahasiswa.
 */
export async function deleteMahasiswaESignature(): Promise<ApiResponse<null>> {
  const manageUrlResponse = await getSignatureManageUrl();
  if (!manageUrlResponse.success || !manageUrlResponse.data) {
    return {
      success: false,
      message:
        manageUrlResponse.message ||
        "Kelola e-signature hanya tersedia di SSO.",
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
