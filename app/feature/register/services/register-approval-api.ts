import { apiClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  nip?: string;
  company: string;
  position: string;
  phone: string;
  registeredAt: string;
  status: "pending" | "approved" | "rejected";
  studentName: string;
  studentNim: string;
  studentEmail: string;
}

export interface PendingEmailChangeRequest {
  id: string;
  mentorName: string;
  currentEmail: string;
  requestedEmail: string;
  reason: string;
  requestedAt: string;
  studentName: string;
  status: "pending" | "approved" | "rejected";
}

export interface RejectRequestBody {
  reason: string;
}

export interface MentorApprovalRequestItem {
  id: string;
  mentorId?: string | null;
  mentorName: string;
  mentorEmail: string;
  mentorNip?: string | null;
  companyName: string;
  position: string;
  phone?: string | null;
  studentId?: string | null;
  studentName: string;
  studentNim: string;
  studentEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface MentorApprovalApproveData {
  id: string;
  status: "approved";
  approvedAt?: string | null;
}

export interface MentorEmailChangeRequestItem {
  id: string;
  mentorId?: string | null;
  mentorName?: string | null;
  currentEmail: string;
  requestedEmail: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

type RawObj = Record<string, unknown>;

const MENTOR_REQUEST_LIST_ENDPOINTS = [
  "/api/dosen/pembimbing-lapangan/requests",
  "/api/dosen/mentor-registration-requests",
] as const;

const MENTOR_REQUEST_APPROVE_ENDPOINTS = [
  (id: string) => `/api/dosen/pembimbing-lapangan/${id}/approve`,
  (id: string) => `/api/dosen/mentor-registration-requests/${id}/approve`,
] as const;

const MENTOR_REQUEST_REJECT_ENDPOINTS = [
  (id: string) => `/api/dosen/pembimbing-lapangan/${id}/reject`,
  (id: string) => `/api/dosen/mentor-registration-requests/${id}/reject`,
] as const;

const EMAIL_CHANGE_LIST_ENDPOINTS = [
  "/api/dosen/mentor-email-change-requests",
  "/api/dosen/email-change-requests",
] as const;

const EMAIL_CHANGE_APPROVE_ENDPOINTS = [
  (id: string) => `/api/dosen/mentor-email-change-requests/${id}/approve`,
  (id: string) => `/api/dosen/email-change-requests/${id}/approve`,
] as const;

const EMAIL_CHANGE_REJECT_ENDPOINTS = [
  (id: string) => `/api/dosen/mentor-email-change-requests/${id}/reject`,
  (id: string) => `/api/dosen/email-change-requests/${id}/reject`,
] as const;

function asRecord(value: unknown): RawObj | null {
  return typeof value === "object" && value !== null ? (value as RawObj) : null;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function getFirstString(record: RawObj, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function normalizeStatus(value: string): "pending" | "approved" | "rejected" {
  const normalized = value.toLowerCase();
  if (["approved", "disetujui"].includes(normalized)) return "approved";
  if (["rejected", "ditolak"].includes(normalized)) return "rejected";
  return "pending";
}

function shouldTryNextEndpoint(message: string): boolean {
  const text = message.toLowerCase();
  return text.includes("404") || text.includes("not found") || text.includes("tidak ditemukan");
}

function getArrayData(data: unknown): RawObj[] {
  if (Array.isArray(data)) return data.map((item) => asRecord(item) || {});
  const wrapped = asRecord(data);
  if (wrapped && Array.isArray(wrapped.items)) {
    return wrapped.items.map((item) => asRecord(item) || {});
  }
  return [];
}

function mapRegistration(raw: RawObj, index: number): PendingRegistration {
  const mentor = asRecord(raw.mentor) || asRecord(raw.pembimbing) || raw;
  const student = asRecord(raw.student) || asRecord(raw.mahasiswa) || {};

  return {
    id: getFirstString(raw, ["id", "requestId"], `request-${index}`),
    name: getFirstString(mentor, ["name", "nama", "mentorName"], "-"),
    email: getFirstString(mentor, ["email", "mentorEmail"], "-"),
    nip: getFirstString(mentor, ["nip"], ""),
    company: getFirstString(mentor, ["company", "companyName", "perusahaan"], "-"),
    position: getFirstString(mentor, ["position", "jabatan"], "-"),
    phone: getFirstString(mentor, ["phone", "noHp", "no_hp"], "-"),
    registeredAt: getFirstString(raw, ["registeredAt", "createdAt", "requestedAt"], new Date().toISOString()),
    status: normalizeStatus(getFirstString(raw, ["status", "verificationStatus"], "pending")),
    studentName: getFirstString(student, ["name", "nama", "studentName"], "-"),
    studentNim: getFirstString(student, ["nim", "studentNim"], "-"),
    studentEmail: getFirstString(student, ["email", "studentEmail"], "-"),
  };
}

function mapEmailChange(raw: RawObj, index: number): PendingEmailChangeRequest {
  return {
    id: getFirstString(raw, ["id", "requestId"], `email-change-${index}`),
    mentorName: getFirstString(raw, ["mentorName", "namaMentor", "mentor"], "-"),
    currentEmail: getFirstString(raw, ["currentEmail", "oldEmail", "emailSaatIni"], "-"),
    requestedEmail: getFirstString(raw, ["requestedEmail", "newEmail", "emailBaru"], "-"),
    reason: getFirstString(raw, ["reason", "alasan"], "-"),
    requestedAt: getFirstString(raw, ["requestedAt", "createdAt"], new Date().toISOString()),
    studentName: getFirstString(raw, ["studentName", "mahasiswa", "namaMahasiswa"], "-"),
    status: normalizeStatus(getFirstString(raw, ["status"], "pending")),
  };
}

async function getFromEndpointList(
  endpoints: readonly string[],
): Promise<ApiResponse<RawObj[]>> {
  let lastMessage = "Endpoint tidak tersedia";

  for (const endpoint of endpoints) {
    const response = await apiClient<unknown>(endpoint);
    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: getArrayData(response.data),
      };
    }

    lastMessage = response.message || lastMessage;
    if (!shouldTryNextEndpoint(lastMessage)) break;
  }

  return {
    success: false,
    message: lastMessage,
    data: [],
  };
}

async function performActionOnEndpointList(
  endpointBuilders: readonly ((id: string) => string)[],
  id: string,
  body?: unknown,
): Promise<ApiResponse<null>> {
  let lastMessage = "Endpoint tidak tersedia";

  for (const build of endpointBuilders) {
    const response = await apiClient<null>(build(id), {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.success) {
      return {
        success: true,
        message: response.message || "Berhasil",
        data: null,
      };
    }

    lastMessage = response.message || lastMessage;
    if (!shouldTryNextEndpoint(lastMessage)) break;
  }

  return {
    success: false,
    message: lastMessage,
    data: null,
  };
}

export async function getMentorRegistrationRequests(): Promise<ApiResponse<PendingRegistration[]>> {
  const response = await getFromEndpointList(MENTOR_REQUEST_LIST_ENDPOINTS);
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
    data: (response.data || []).map((item, index) => mapRegistration(item, index)),
  };
}

export async function approveMentorRegistrationRequest(id: string) {
  return performActionOnEndpointList(MENTOR_REQUEST_APPROVE_ENDPOINTS, id);
}

export async function rejectMentorRegistrationRequest(id: string, reason: string) {
  return performActionOnEndpointList(MENTOR_REQUEST_REJECT_ENDPOINTS, id, {
    reason,
  });
}

export async function getMentorEmailChangeRequests(): Promise<ApiResponse<PendingEmailChangeRequest[]>> {
  const response = await getFromEndpointList(EMAIL_CHANGE_LIST_ENDPOINTS);
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
    data: (response.data || []).map((item, index) => mapEmailChange(item, index)),
  };
}

export async function approveMentorEmailChangeRequest(id: string) {
  return performActionOnEndpointList(EMAIL_CHANGE_APPROVE_ENDPOINTS, id);
}

export async function rejectMentorEmailChangeRequest(id: string, reason: string) {
  return performActionOnEndpointList(EMAIL_CHANGE_REJECT_ENDPOINTS, id, {
    reason,
  });
}
