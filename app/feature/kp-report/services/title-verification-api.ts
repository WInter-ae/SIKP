import { apiClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import type { PengajuanJudul } from "../types/title";

type RawObject = Record<string, unknown>;

export type TitleVerificationAction = "APPROVE" | "REJECT" | "REVISE";

export interface TitleSubmissionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  studentEmail?: string | null;
  teamName?: string | null;
  companyName?: string | null;
  proposedTitle: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVISION";
  submittedAt: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  revisedTitle?: string | null;
}

export interface VerifyTitleRequest {
  action: TitleVerificationAction;
  notes?: string;
  revisedTitle?: string;
}

export interface VerifyTitleResponse {
  id: string;
  status: TitleSubmissionItem["status"];
  notes?: string | null;
  revisedTitle?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
}

const LIST_ENDPOINTS = [
  "/api/dosen/kp/verifikasi-judul",
  "/api/dosen/kp/title-submissions",
  "/api/dosen/title-submissions",
] as const;

const VERIFY_ENDPOINT_BUILDERS = [
  (id: string) => `/api/dosen/kp/verifikasi-judul/${id}`,
  (id: string) => `/api/dosen/kp/title-submissions/${id}/verify`,
  (id: string) => `/api/dosen/title-submissions/${id}/verify`,
] as const;

function asRecord(value: unknown): RawObject | null {
  return typeof value === "object" && value !== null
    ? (value as RawObject)
    : null;
}

function getFirstString(
  record: RawObject,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function normalizeStatus(rawStatus: string): TitleSubmissionItem["status"] {
  const status = rawStatus.toLowerCase();
  if (["approved", "disetujui", "approve"].includes(status)) return "APPROVED";
  if (["rejected", "ditolak", "reject"].includes(status)) return "REJECTED";
  if (
    [
      "revision",
      "revisi",
      "revise",
      "needs_revision",
      "revision_needed",
    ].includes(status)
  )
    return "REVISION";
  return "PENDING";
}

function canTryNextEndpoint(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("404") ||
    lower.includes("not found") ||
    lower.includes("tidak ditemukan")
  );
}

function getArrayFromResponse(data: unknown): RawObject[] {
  if (Array.isArray(data)) {
    return data.map((item) => asRecord(item) || {});
  }

  const wrapped = asRecord(data);
  if (wrapped && Array.isArray(wrapped.items)) {
    return wrapped.items.map((item) => asRecord(item) || {});
  }

  if (wrapped && Array.isArray(wrapped.data)) {
    return wrapped.data.map((item) => asRecord(item) || {});
  }

  return [];
}

function mapRawToTitleSubmissionItem(
  raw: RawObject,
  index: number,
): TitleSubmissionItem {
  const student = asRecord(raw.student) || asRecord(raw.mahasiswa) || {};
  const team = asRecord(raw.team) || asRecord(raw.tim) || {};
  const proposal = asRecord(raw.proposal) || asRecord(raw.data) || raw;

  return {
    id: getFirstString(
      raw,
      ["id", "requestId", "submissionId", "titleSubmissionId"],
      `title-${index}`,
    ),
    studentId: getFirstString(
      student,
      ["id", "studentId", "userId"],
      getFirstString(raw, ["studentId"], `student-${index}`),
    ),
    studentName: getFirstString(
      student,
      ["name", "nama", "studentName"],
      "Mahasiswa",
    ),
    studentNim: getFirstString(
      student,
      ["nim", "studentNim", "studentNumber"],
      "-",
    ),
    studentEmail:
      getFirstString(student, ["email", "studentEmail"], "") || null,
    teamName: getFirstString(team, ["name", "nama", "teamName"], "") || null,
    companyName:
      getFirstString(
        raw,
        ["companyName", "tempatMagang", "company", "instansi"],
        "",
      ) || null,
    proposedTitle: getFirstString(
      proposal,
      ["proposedTitle", "judulLaporan", "title", "judul"],
      "Judul belum tersedia",
    ),
    description: getFirstString(proposal, ["description", "deskripsi"], "-"),
    status: normalizeStatus(
      getFirstString(
        raw,
        ["status", "verificationStatus", "titleStatus"],
        "PENDING",
      ),
    ),
    submittedAt: getFirstString(
      raw,
      ["submittedAt", "createdAt", "tanggalPengajuan"],
      new Date().toISOString(),
    ),
    verifiedAt:
      getFirstString(
        raw,
        ["verifiedAt", "tanggalVerifikasi", "updatedAt"],
        "",
      ) || null,
    verifiedBy: getFirstString(raw, ["verifiedBy", "approvedBy"], "") || null,
    notes: getFirstString(raw, ["notes", "catatan", "feedback"], "") || null,
    rejectionReason:
      getFirstString(raw, ["rejectionReason", "rejectedReason"], "") || null,
    revisedTitle:
      getFirstString(raw, ["revisedTitle", "judulRevisi"], "") || null,
  };
}

export function mapTitleSubmissionItemToPengajuanJudul(
  item: TitleSubmissionItem,
): PengajuanJudul {
  return {
    id: item.id,
    mahasiswa: {
      id: item.studentId,
      nama: item.studentName,
      nim: item.studentNim,
      prodi: "-",
      email: item.studentEmail || undefined,
    },
    tim: item.teamName
      ? {
          id: `${item.id}-team`,
          nama: item.teamName,
          anggota: [],
        }
      : undefined,
    data: {
      judulLaporan: item.proposedTitle,
      tempatMagang: item.companyName || "-",
      periode: {
        mulai: item.submittedAt,
        selesai: item.submittedAt,
      },
      deskripsi: item.description,
    },
    status:
      item.status === "APPROVED"
        ? "disetujui"
        : item.status === "REJECTED"
          ? "ditolak"
          : item.status === "REVISION"
            ? "revisi"
            : "diajukan",
    tanggalPengajuan: item.submittedAt,
    tanggalVerifikasi: item.verifiedAt || undefined,
    catatanDosen: item.notes || item.rejectionReason || undefined,
  };
}

async function tryGetList(endpoint: string): Promise<ApiResponse<RawObject[]>> {
  const response = await apiClient<unknown>(endpoint);

  if (!response.success) {
    return {
      success: false,
      message: response.message,
      data: [],
    };
  }

  return {
    success: true,
    message: response.message,
    data: getArrayFromResponse(response.data),
  };
}

export async function getTitleSubmissionItemsForLecturer(): Promise<
  ApiResponse<TitleSubmissionItem[]>
> {
  let lastMessage = "Endpoint verifikasi judul belum tersedia";

  for (const endpoint of LIST_ENDPOINTS) {
    const response = await tryGetList(endpoint);

    if (response.success) {
      return {
        success: true,
        message: response.message || "OK",
        data: (response.data || []).map((item, index) =>
          mapRawToTitleSubmissionItem(item, index),
        ),
      };
    }

    lastMessage = response.message || lastMessage;
    if (!canTryNextEndpoint(lastMessage)) break;
  }

  return {
    success: false,
    message: lastMessage,
    data: [],
  };
}

export async function getTitleSubmissionsForLecturer(): Promise<
  ApiResponse<PengajuanJudul[]>
> {
  const response = await getTitleSubmissionItemsForLecturer();
  if (!response.success) {
    return {
      success: false,
      message: response.message,
      data: [],
    };
  }

  return {
    success: true,
    message: response.message,
    data: (response.data || []).map(mapTitleSubmissionItemToPengajuanJudul),
  };
}

export async function verifyTitleSubmission(
  id: string,
  payload: VerifyTitleRequest,
): Promise<ApiResponse<VerifyTitleResponse>> {
  let lastMessage = "Endpoint verifikasi judul belum tersedia";

  for (const build of VERIFY_ENDPOINT_BUILDERS) {
    const endpoint = build(id);
    const response = await apiClient<unknown>(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (response.success) {
      const verified = asRecord(response.data) || {};
      return {
        success: true,
        message: response.message || "Berhasil memverifikasi judul",
        data: {
          id: getFirstString(verified, ["id", "requestId", "submissionId"], id),
          status: normalizeStatus(
            getFirstString(
              verified,
              ["status", "verificationStatus"],
              payload.action,
            ),
          ),
          notes:
            getFirstString(
              verified,
              ["notes", "catatan", "feedback"],
              payload.notes || "",
            ) || null,
          revisedTitle:
            getFirstString(
              verified,
              ["revisedTitle", "judulRevisi"],
              payload.revisedTitle || "",
            ) || null,
          verifiedAt:
            getFirstString(
              verified,
              ["verifiedAt", "tanggalVerifikasi", "updatedAt"],
              "",
            ) || null,
          verifiedBy:
            getFirstString(verified, ["verifiedBy", "approvedBy"], "") || null,
        },
      };
    }

    lastMessage = response.message || lastMessage;
    if (!canTryNextEndpoint(lastMessage)) break;
  }

  return {
    success: false,
    message: lastMessage,
    data: null,
  };
}
