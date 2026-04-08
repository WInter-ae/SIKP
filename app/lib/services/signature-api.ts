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

export async function uploadProfileSignature(
  signatureFile: File,
): Promise<ApiResponse<SignatureAsset>> {
  const formData = new FormData();
  formData.append("signatureFile", signatureFile);

  const response = await apiClient<unknown>("/api/profile/signature", {
    method: "POST",
    body: formData,
  });

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Gagal mengunggah signature.",
      data: null,
    };
  }

  const signature = normalizeSignaturePayload(response.data);
  if (!signature) {
    return {
      success: false,
      message: "Payload signature tidak valid.",
      data: null,
    };
  }

  return {
    success: true,
    message: response.message || "Signature berhasil diunggah.",
    data: signature,
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

export async function activateProfileSignature(
  signatureId: string,
): Promise<ApiResponse<SignatureAsset>> {
  const response = await apiClient<unknown>(
    `/api/profile/signature/${signatureId}/activate`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  if (!response.success || !response.data) {
    return {
      success: false,
      message: response.message || "Gagal mengaktifkan signature.",
      data: null,
    };
  }

  const signature = normalizeSignaturePayload(response.data);
  if (!signature) {
    return {
      success: false,
      message: "Payload signature aktif tidak valid.",
      data: null,
    };
  }

  return {
    success: true,
    message: response.message || "Signature aktif berhasil diperbarui.",
    data: signature,
  };
}

export async function deleteProfileSignatureById(
  signatureId: string,
): Promise<ApiResponse<null>> {
  return apiClient<null>(`/api/profile/signature/${signatureId}`, {
    method: "DELETE",
  });
}

export async function deleteActiveProfileSignature(): Promise<
  ApiResponse<null>
> {
  const activeSignature = await getActiveProfileSignature();

  if (!activeSignature.success) {
    return {
      success: false,
      message: activeSignature.message,
      data: null,
    };
  }

  if (!activeSignature.data) {
    return {
      success: true,
      message: "Tidak ada signature aktif untuk dihapus.",
      data: null,
    };
  }

  return deleteProfileSignatureById(activeSignature.data.id);
}

export async function dataUrlToFile(
  dataUrl: string,
  filename = `signature-${Date.now()}.png`,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/png" });
}
