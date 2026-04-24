/**
 * Letter Request Status Service
 * Menangani status pengajuan surat (surat kesediaan & form permohonan) per anggota tim.
 */

import { sikpClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

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

type RawItem = Record<string, unknown>;

function normalizeDocumentType(value: unknown): LetterRequestDocumentType | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  if (v === "SURAT_KESEDIAAN") return "SURAT_KESEDIAAN";
  if (v === "FORM_PERMOHONAN" || v === "SURAT_PERMOHONAN" || v === "PERMOHONAN") return "FORM_PERMOHONAN";
  return null;
}

function normalizeLatestStatus(value: unknown): LetterRequestStatusItem["latestStatus"] {
  if (typeof value !== "string") return null;
  const v = value.trim().toUpperCase();
  if (v === "MENUNGGU" || v === "PENDING") return "MENUNGGU";
  if (v === "DISETUJUI" || v === "APPROVED") return "DISETUJUI";
  if (v === "DITOLAK" || v === "REJECTED") return "DITOLAK";
  return null;
}

function getString(item: RawItem, keys: string[]): string | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function getBool(item: RawItem, keys: string[]): boolean | null {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "boolean") return value;
  }
  return null;
}

function normalizeStatusItem(item: RawItem): LetterRequestStatusItem | null {
  const memberUserId = getString(item, ["memberUserId", "member_user_id", "memberId", "member_id", "userId", "user_id"]);
  const documentType = normalizeDocumentType(getString(item, ["documentType", "document_type", "type", "letterType"]));
  if (!memberUserId || !documentType) return null;

  const latestStatus = normalizeLatestStatus(getString(item, ["latestStatus", "latest_status", "status"]));
  const latestRequestId = getString(item, ["latestRequestId", "latest_request_id", "requestId", "request_id", "id"]);
  const submittedAt = getString(item, ["submittedAt", "submitted_at", "createdAt", "created_at"]);
  const explicitSubmitted = getBool(item, ["isAlreadySubmitted", "is_already_submitted", "alreadySubmitted", "already_submitted"]);
  const signedFileUrl = getString(item, ["signedFileUrl", "signed_file_url", "signedUrl", "signed_url"]);
  const rejectionReason = getString(item, ["rejectionReason", "rejection_reason", "reason"]);

  const dosenObject = typeof item.dosen === "object" && item.dosen !== null ? (item.dosen as RawItem) : null;
  const dosenNameFromObject = dosenObject ? getString(dosenObject, ["name", "nama", "fullName", "namaLengkap", "nama_lengkap"]) : null;
  const dosenName = getString(item, ["dosenNama", "dosen_nama", "namaDosen", "nama_dosen", "dosenName", "dosen_name", "lecturerName", "lecturer_name"]) ?? dosenNameFromObject;

  return {
    memberUserId,
    documentType,
    isAlreadySubmitted: explicitSubmitted ?? Boolean(latestStatus || latestRequestId || submittedAt),
    latestStatus,
    latestRequestId,
    submittedAt,
    signedFileUrl,
    rejectionReason,
    dosenName,
  };
}

function extractStatusItems(data: unknown): LetterRequestStatusItem[] {
  const candidates: unknown[] = [
    data,
    typeof data === "object" && data !== null ? (data as Record<string, unknown>).items : null,
    typeof data === "object" && data !== null ? (data as Record<string, unknown>).statuses : null,
    typeof data === "object" && data !== null ? (data as Record<string, unknown>).records : null,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    return candidate
      .map((item) => typeof item === "object" && item !== null ? normalizeStatusItem(item as RawItem) : null)
      .filter((item): item is LetterRequestStatusItem => item !== null);
  }

  return [];
}

/**
 * Ambil status pengajuan surat untuk semua anggota tim dalam submission.
 * Mencoba beberapa endpoint untuk kompatibilitas backend.
 */
export async function getSubmissionLetterRequestStatuses(
  submissionId: string,
): Promise<ApiResponse<LetterRequestStatusItem[]>> {
  const endpoints = [
    `/api/mahasiswa/submissions/${submissionId}/letter-request-status`,
    `/api/submissions/${submissionId}/letter-request-status`,
  ];

  for (const endpoint of endpoints) {
    const response = await sikpClient.get<LetterRequestStatusItem[]>(endpoint);

    if (response.success) {
      return { ...response, data: extractStatusItems(response.data) };
    }

    const message = response.message?.toLowerCase() || "";
    const isNotFound =
      message.includes("404") ||
      message.includes("not found") ||
      message.includes("cannot get") ||
      message.includes("route") ||
      message.includes("endpoint");

    if (!isNotFound) return response;
  }

  return {
    success: false,
    message: "Endpoint status pengajuan surat tidak ditemukan",
    data: null,
  };
}
