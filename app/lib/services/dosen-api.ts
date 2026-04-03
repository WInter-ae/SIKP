/**
 * Dosen Profile & E-Signature API Service
 * Handles profile management and e-signature upload to Cloudflare R2
 */

import { apiClient } from "~/lib/api-client";

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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
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
 * Get current dosen profile (authenticated user)
 * Endpoint: GET /api/dosen/me
 */
export async function getMyProfile(): Promise<ApiResponse<DosenProfile>> {
  try {
    const response = await apiClient<DosenProfile>("/api/dosen/me");
    return response;
  } catch (error) {
    console.error("Error fetching dosen profile:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch profile",
      data: null,
    };
  }
}

/**
 * Get dosen dashboard data (authenticated user)
 * Endpoint: GET /api/dosen/dashboard
 */
export async function getDosenDashboard(): Promise<
  ApiResponse<DosenDashboardData>
> {
  try {
    const response = await apiClient<DosenDashboardData>("/api/dosen/dashboard");
    return response;
  } catch (error) {
    console.error("Error fetching dosen dashboard:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch dosen dashboard",
      data: null,
    };
  }
}

/**
 * Get wakil dekan dashboard data (authenticated user)
 * Endpoint: GET /api/dosen/dashboard/wakdek
 */
export async function getWakdekDashboard(): Promise<
  ApiResponse<WakdekDashboardData>
> {
  try {
    const response = await apiClient<WakdekDashboardData>(
      "/api/dosen/dashboard/wakdek",
    );
    return response;
  } catch (error) {
    console.error("Error fetching wakdek dashboard:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch wakdek dashboard",
      data: null,
    };
  }
}

/**
 * Update dosen profile
 * Endpoint: PUT /api/dosen/me/profile
 * @param profileData - Partial profile data to update
 */
export async function updateMyProfile(profileData: {
  nama?: string;
  email?: string;
  telepon?: string;
  jabatan?: string;
  fakultas?: string;
  programStudi?: string;
}): Promise<ApiResponse<DosenProfile>> {
  try {
    const response = await apiClient<DosenProfile>("/api/dosen/me/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update profile",
      data: null,
    };
  }
}

/**
 * Upload or replace e-signature
 * Endpoint: PUT /api/dosen/me/esignature
 * @param signatureFile - File object (PNG/JPG/JPEG, max 2MB)
 */
export async function uploadESignature(
  signatureFile: File,
): Promise<ApiResponse<ESignatureUploadResponse>> {
  try {
    // Validate file
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

    // Build FormData
    const formData = new FormData();
    formData.append("signatureFile", signatureFile);

    // Upload via API
    const response = await apiClient<ESignatureUploadResponse>(
      "/api/dosen/me/esignature",
      {
        method: "PUT",
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary for multipart
      },
    );

    return response;
  } catch (error) {
    console.error("Error uploading e-signature:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload e-signature",
      data: null,
    };
  }
}

/**
 * Delete e-signature
 * Endpoint: DELETE /api/dosen/me/esignature
 */
export async function deleteESignature(): Promise<ApiResponse<null>> {
  try {
    const response = await apiClient<null>("/api/dosen/me/esignature", {
      method: "DELETE",
    });

    return response;
  } catch (error) {
    console.error("Error deleting e-signature:", error);
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
 * @param dataUrl - Data URL string (e.g., "data:image/png;base64,...")
 * @param filename - Optional filename (default: "signature-{timestamp}.png")
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
