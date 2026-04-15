import { apiClient, type ApiResponse } from "~/lib/api-client";

export interface SignatureAsset {
  id: string;
  signatureImage: string;
  uploadedAt?: string;
  isActive?: boolean;
}

interface SignaturePayload {
  id?: unknown;
  signatureImage?: unknown;
  signatureUrl?: unknown;
  url?: unknown;
  uploadedAt?: unknown;
  createdAt?: unknown;
  isActive?: unknown;
}

interface SignatureListPayload {
  signatures?: unknown;
  items?: unknown;
}

interface SignatureManageUrlPayload {
  manageUrl?: unknown;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function normalizeSignaturePayload(payload: unknown): SignatureAsset | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as SignaturePayload;
  const id = pickString(data.id);
  const signatureImage = pickString(
    data.signatureImage,
    data.signatureUrl,
    data.url,
  );

  if (!id || !signatureImage) {
    return null;
  }

  return {
    id,
    signatureImage,
    uploadedAt: pickString(data.uploadedAt, data.createdAt) || undefined,
    isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
  };
}

function normalizeSignatureList(payload: unknown): SignatureAsset[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const listPayload = payload as SignatureListPayload;
  const rawItems = Array.isArray(listPayload.signatures)
    ? listPayload.signatures
    : Array.isArray(listPayload.items)
      ? listPayload.items
      : [];

  return rawItems
    .map((item) => normalizeSignaturePayload(item))
    .filter((item): item is SignatureAsset => Boolean(item));
}

export async function getSignatureManageUrl(): Promise<ApiResponse<string>> {
  const response = await apiClient<SignatureManageUrlPayload>(
    "/api/profile/signature/manage-url",
    {
      method: "GET",
    },
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Gagal mengambil URL kelola signature di SSO.",
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

function writeDisabledResponse(message?: string): ApiResponse<null> {
  return {
    success: false,
    message:
      message ||
      "Kelola signature hanya tersedia di SSO. Gunakan URL kelola signature.",
    data: null,
  };
}

export async function getActiveProfileSignature(): Promise<
  ApiResponse<SignatureAsset | null>
> {
  const response = await apiClient<unknown>("/api/profile/signature", {
    method: "GET",
  });

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

// Deprecated compatibility helpers. Keep compile compatibility for legacy callers,
// but enforce SSO-only signature management.
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

export async function dataUrlToFile(
  dataUrl: string,
  filename = `signature-${Date.now()}.png`,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}

// Signature write operations are intentionally removed from SIKP.
// Management must happen in SSO via getSignatureManageUrl().
