/**
 * Mahasiswa Profile & E-Signature API Service
 * Handles profile management and e-signature upload for mahasiswa
 */

import { apiClient } from "~/lib/api-client";

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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * Get current mahasiswa profile (authenticated user)
 * Endpoint: GET /api/mahasiswa/me
 */
export async function getMyMahasiswaProfile(): Promise<
  ApiResponse<MahasiswaProfile>
> {
  try {
    return await apiClient<MahasiswaProfile>("/api/mahasiswa/me");
  } catch (error) {
    console.error("Error fetching mahasiswa profile:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch profile",
      data: null,
    };
  }
}

/**
 * Update mahasiswa profile
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
  try {
    return await apiClient<MahasiswaProfile>("/api/mahasiswa/me/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating mahasiswa profile:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update profile",
      data: null,
    };
  }
}

/**
 * Upload or replace mahasiswa e-signature
 * Endpoint: PUT /api/mahasiswa/me/esignature
 */
export async function uploadMahasiswaESignature(
  signatureFile: File,
): Promise<ApiResponse<ESignatureUploadResponse>> {
  try {
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

    const formData = new FormData();
    formData.append("signatureFile", signatureFile);

    return await apiClient<ESignatureUploadResponse>(
      "/api/mahasiswa/me/esignature",
      {
        method: "PUT",
        body: formData,
      },
    );
  } catch (error) {
    console.error("Error uploading mahasiswa e-signature:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload e-signature",
      data: null,
    };
  }
}

/**
 * Delete mahasiswa e-signature
 * Endpoint: DELETE /api/mahasiswa/me/esignature
 */
export async function deleteMahasiswaESignature(): Promise<ApiResponse<null>> {
  try {
    return await apiClient<null>("/api/mahasiswa/me/esignature", {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Error deleting mahasiswa e-signature:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete e-signature",
      data: null,
    };
  }
}

/**
 * Helper: Convert Data URL (from canvas) to File
 */
export async function dataUrlToFile(
  dataUrl: string,
  filename?: string,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const finalFilename = filename || `signature-${Date.now()}.png`;
  return new File([blob], finalFilename, { type: blob.type || "image/png" });
}
