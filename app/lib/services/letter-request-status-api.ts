import { apiClient } from "~/lib/api-client";

export type LetterRequestDocumentType = "SURAT_KESEDIAAN" | "FORM_PERMOHONAN";

export interface LetterRequestStatusItem {
  memberUserId: string;
  documentType: LetterRequestDocumentType;
  isAlreadySubmitted: boolean;
  latestStatus: "MENUNGGU" | "DISETUJUI" | "DITOLAK" | null;
  latestRequestId: string | null;
  submittedAt: string | null;
  signedFileUrl: string | null;
  rejectionReason: string | null;
  dosenName: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T | null;
}

type RawLetterRequestStatusItem = Record<string, unknown>;

function normalizeDocumentType(
  value: unknown,
): LetterRequestDocumentType | null {
  if (typeof value !== "string") return null;

  const normalizedValue = value.trim().toUpperCase();

  if (normalizedValue === "SURAT_KESEDIAAN") {
    return "SURAT_KESEDIAAN";
  }

  if (
    normalizedValue === "FORM_PERMOHONAN" ||
    normalizedValue === "SURAT_PERMOHONAN" ||
    normalizedValue === "PERMOHONAN"
  ) {
    return "FORM_PERMOHONAN";
  }

  return null;
}

function normalizeLatestStatus(
  value: unknown,
): LetterRequestStatusItem["latestStatus"] {
  if (typeof value !== "string") return null;

  const normalizedValue = value.trim().toUpperCase();

  if (normalizedValue === "MENUNGGU" || normalizedValue === "PENDING") {
    return "MENUNGGU";
  }

  if (normalizedValue === "DISETUJUI" || normalizedValue === "APPROVED") {
    return "DISETUJUI";
  }

  if (normalizedValue === "DITOLAK" || normalizedValue === "REJECTED") {
    return "DITOLAK";
  }

  return null;
}

function getStringValue(
  item: RawLetterRequestStatusItem,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function getBooleanValue(
  item: RawLetterRequestStatusItem,
  keys: string[],
): boolean | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function normalizeStatusItem(
  item: RawLetterRequestStatusItem,
): LetterRequestStatusItem | null {
  const memberUserId = getStringValue(item, [
    "memberUserId",
    "member_user_id",
    "memberId",
    "member_id",
    "userId",
    "user_id",
  ]);
  const documentType = normalizeDocumentType(
    getStringValue(item, [
      "documentType",
      "document_type",
      "type",
      "letterType",
    ]),
  );

  if (!memberUserId || !documentType) {
    return null;
  }

  const latestStatus = normalizeLatestStatus(
    getStringValue(item, ["latestStatus", "latest_status", "status"]),
  );
  const latestRequestId = getStringValue(item, [
    "latestRequestId",
    "latest_request_id",
    "requestId",
    "request_id",
    "id",
  ]);
  const submittedAt = getStringValue(item, [
    "submittedAt",
    "submitted_at",
    "createdAt",
    "created_at",
  ]);
  const explicitSubmitted = getBooleanValue(item, [
    "isAlreadySubmitted",
    "is_already_submitted",
    "alreadySubmitted",
    "already_submitted",
  ]);
  const signedFileUrl = getStringValue(item, [
    "signedFileUrl",
    "signed_file_url",
    "signedUrl",
    "signed_url",
  ]);
  const rejectionReason = getStringValue(item, [
    "rejectionReason",
    "rejection_reason",
    "reason",
  ]);
  const dosenObject =
    typeof item.dosen === "object" && item.dosen !== null
      ? (item.dosen as RawLetterRequestStatusItem)
      : null;
  const dosenNameFromObject = dosenObject
    ? getStringValue(dosenObject, [
        "name",
        "nama",
        "fullName",
        "namaLengkap",
        "nama_lengkap",
      ])
    : null;
  const dosenName =
    getStringValue(item, [
      "dosenNama",
      "dosen_nama",
      "namaDosen",
      "nama_dosen",
      "dosenName",
      "dosen_name",
      "lecturerName",
      "lecturer_name",
    ]) ?? dosenNameFromObject;

  return {
    memberUserId,
    documentType,
    isAlreadySubmitted:
      explicitSubmitted ??
      Boolean(latestStatus || latestRequestId || submittedAt),
    latestStatus,
    latestRequestId,
    submittedAt,
    signedFileUrl,
    rejectionReason,
    dosenName,
  };
}

function extractStatusItems(data: unknown): LetterRequestStatusItem[] {
  const candidateArrays: unknown[] = [
    data,
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>).items
      : null,
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>).statuses
      : null,
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>).records
      : null,
  ];

  for (const candidate of candidateArrays) {
    if (!Array.isArray(candidate)) continue;

    return candidate
      .map((item) =>
        typeof item === "object" && item !== null
          ? normalizeStatusItem(item as RawLetterRequestStatusItem)
          : null,
      )
      .filter((item): item is LetterRequestStatusItem => item !== null);
  }

  return [];
}

export async function getSubmissionLetterRequestStatuses(
  submissionId: string,
): Promise<ApiResponse<LetterRequestStatusItem[]>> {
  const endpoints = [
    `/api/mahasiswa/submissions/${submissionId}/letter-request-status`,
    `/api/submissions/${submissionId}/letter-request-status`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await apiClient<LetterRequestStatusItem[]>(endpoint, {
        method: "GET",
      });

      if (response.success) {
        return {
          ...response,
          data: extractStatusItems(response.data),
        };
      }

      const message = response.message?.toLowerCase() || "";
      const isNotFound =
        message.includes("404") ||
        message.includes("not found") ||
        message.includes("cannot get") ||
        message.includes("route") ||
        message.includes("endpoint");

      if (!isNotFound) return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal memuat status pengajuan surat",
        data: null,
      };
    }
  }

  return {
    success: false,
    message: "Endpoint status pengajuan surat tidak ditemukan",
    data: null,
  };
}
