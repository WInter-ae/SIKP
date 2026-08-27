/**
 * Signature Service
 *
 * Menangani profile signature — read dari backend SIKP,
 * write/delete hanya bisa dilakukan via SSO (getSignatureManageUrl).
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import { API_ENDPOINTS } from "~/lib/constants/endpoints";
import { z } from "zod";

// ==================== TYPES ====================

export interface SignatureAsset {
  id: string;
  signatureImage: string;
  uploadedAt?: string;
  isActive?: boolean;
}

// Types digantikan validasi Zod

// ==================== NORMALIZERS ====================

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

function normalizeSignaturePayload(payload: unknown): SignatureAsset | null {
  const result = z.record(z.string(), z.unknown()).safeParse(payload);
  if (!result.success) return null;

  const data = (result.data.activeSignature && typeof result.data.activeSignature === 'object') 
    ? (result.data.activeSignature as Record<string, unknown>)
    : result.data;

  const id = pickString(data.id, data.signatureId);
  const signatureImage = pickString(
    data.signatureImage,
    data.signatureUrl,
    data.url,
    data.svg,
  );

  if (!id || !signatureImage) return null;

  let finalImage = signatureImage;
  if (finalImage.trim().startsWith('<svg')) {
    const encoded = btoa(finalImage);
    finalImage = `data:image/svg+xml;base64,${encoded}`;
  }

  return {
    id,
    signatureImage: finalImage,
    uploadedAt: pickString(data.uploadedAt, data.createdAt) || undefined,
    isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
  };
}

function normalizeSignatureList(payload: unknown): SignatureAsset[] {
  const result = z.record(z.string(), z.unknown()).safeParse(payload);
  if (!result.success) return [];

  const listPayload = result.data;
  const rawItems = Array.isArray(listPayload.signatures)
    ? listPayload.signatures
    : Array.isArray(listPayload.items)
      ? listPayload.items
      : [];

  return rawItems
    .map((item) => normalizeSignaturePayload(item))
    .filter((item): item is SignatureAsset => Boolean(item));
}

// ==================== API FUNCTIONS ====================

/**
 * Ambil URL kelola signature di SSO.
 */
export async function getSignatureManageUrl(): Promise<ApiResponse<string>> {
  const response = await sikpClient.get<Record<string, unknown>>(
    API_ENDPOINTS.SIGNATURE.MANAGE_URL || "/api/profile/signature/manage-url",
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message:
        response.message || "Gagal mengambil URL kelola signature di SSO.",
      data: null,
    };
  }

  const manageUrl = pickString(response.data.manageUrl);
  if (!manageUrl) {
    return {
      success: false,
      message: "URL kelola signature SSO tidak tersedia.",
      data: null,
    };
  }

  return {
    success: true,
    message: response.message || "URL kelola signature berhasil diambil.",
    data: manageUrl,
  };
}

/**
 * Ambil signature aktif dari profil.
 */
export async function getActiveProfileSignature(): Promise<
  ApiResponse<SignatureAsset | null>
> {
  const response = await sikpClient.get<unknown>("/api/profile/signature");

  if (!response.success) {
    return {
      success: false,
      message: response.message || "Gagal mengambil signature aktif.",
      data: null,
    };
  }

  const signature = normalizeSignaturePayload(response.data);
  if (signature) {
    return {
      success: true,
      message: response.message || "Signature aktif berhasil diambil.",
      data: signature,
    };
  }

  const signatures = normalizeSignatureList(response.data);
  const activeSignature =
    signatures.find((item) => item.isActive) || signatures[0] || null;

  return {
    success: true,
    message: response.message || "Signature aktif berhasil diambil.",
    data: activeSignature,
  };
}

function writeDisabledResponse(message?: string): ApiResponse<null> {
  return {
    success: false,
    message:
      message ||
      "Kelola signature hanya tersedia di SSO. Gunakan URL kelola signature.",
    data: null,
  };
}

// Deprecated compatibility helpers — signature write harus via SSO.
export async function uploadProfileSignature(
  _signatureFile: File,
): Promise<ApiResponse<SignatureAsset>> {
  const manage = await getSignatureManageUrl();
  return {
    success: false,
    message:
      manage.message ||
      "Upload signature dinonaktifkan di SIKP. Kelola signature di SSO.",
    data: null,
  };
}

export async function activateProfileSignature(
  _signatureId: string,
): Promise<ApiResponse<SignatureAsset>> {
  const manage = await getSignatureManageUrl();
  return {
    success: false,
    message:
      manage.message ||
      "Aktivasi signature dinonaktifkan di SIKP. Kelola signature di SSO.",
    data: null,
  };
}

export async function deleteProfileSignatureById(
  _signatureId: string,
): Promise<ApiResponse<null>> {
  const manage = await getSignatureManageUrl();
  return writeDisabledResponse(manage.message);
}

export async function deleteActiveProfileSignature(): Promise<
  ApiResponse<null>
> {
  const manage = await getSignatureManageUrl();
  return writeDisabledResponse(manage.message);
}

/**
 * Helper: Convert Data URL (dari canvas) ke File.
 */
export async function dataUrlToFile(
  dataUrl: string,
  filename = `signature-${Date.now()}.png`,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

/**
 * Simpan tanda tangan mentor aktif ke tabel internships di DB.
 *
 * Alur:
 * 1. Ambil TTD aktif dari SSO via getActiveProfileSignature()
 * 2. Kirim base64-nya ke backend PUT /api/profile/signature/save-to-internship
 * 3. Backend langsung simpan ke kolom mentor_signature_base64
 *
 * Tidak perlu deploy Worker baru — endpoint ini sudah ada di production.
 */
export async function saveSignatureToInternship(
  internshipId: string,
): Promise<ApiResponse<{ internshipId: string; mimeType: string; cachedAt: string } | null>> {
  // 1. Ambil TTD aktif dari SSO
  const sigResponse = await getActiveProfileSignature();

  if (!sigResponse.success || !sigResponse.data?.signatureImage) {
    return {
      success: false,
      message:
        sigResponse.message ||
        "Tanda tangan belum tersedia. Silakan upload TTD di portal SSO terlebih dahulu.",
      data: null,
    };
  }

  const signatureBase64 = sigResponse.data.signatureImage;
  // Deteksi mimeType dari data URL prefix jika ada
  let mimeType = "image/png";
  if (signatureBase64.startsWith("data:")) {
    const mimeMatch = signatureBase64.match(/^data:([^;]+);/);
    if (mimeMatch) mimeType = mimeMatch[1];
  } else if (signatureBase64.trim().startsWith("<svg")) {
    mimeType = "image/svg+xml";
  }

  // 2. Kirim ke backend untuk disimpan ke DB
  const saveResponse = await sikpClient.request<{
    internshipId: string;
    mimeType: string;
    cachedAt: string;
  }>("/api/profile/signature/save-to-internship", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      internshipId,
      signatureBase64,
      mimeType,
    }),
  });

  return saveResponse;
}
