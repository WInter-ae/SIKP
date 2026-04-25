import { apiClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export interface DosenLogbookMonitorItem {
  id: string;
  detailRouteKey: string;
  studentId?: string;
  studentName: string;
  nim: string;
  company: string;
  date: string;
  activity: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  hours?: number;
  rejectionReason?: string;
  mentorName?: string;
  mentorId?: string;
  studentEmail?: string;
}

export interface DosenLogbookMonitorByStudentItem {
  studentId: string;
  studentName: string;
  nim: string;
  email?: string | null;
  company: string;
  mentorId?: string | null;
  logbooks: DosenLogbookMonitorItem[];
}

type RawObject = Record<string, unknown>;

const LIST_ENDPOINTS = [
  "/api/internship-monitoring/logbook",
] as const;

const DETAIL_ENDPOINT_BUILDERS = [
  (studentId: string) => `/api/internship-monitoring/logbook/${studentId}`,
] as const;

function asRecord(value: unknown): RawObject | null {
  return typeof value === "object" && value !== null ? (value as RawObject) : null;
}

function getFirstString(record: RawObject, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
}

function normalizeStatus(value: string): "PENDING" | "APPROVED" | "REJECTED" {
  const raw = value.toUpperCase();
  if (["APPROVED", "DISETUJUI"].includes(raw)) return "APPROVED";
  if (["REJECTED", "DITOLAK"].includes(raw)) return "REJECTED";
  return "PENDING";
}

function shouldTryNextEndpoint(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("404") || lower.includes("not found") || lower.includes("tidak ditemukan");
}

function getArrayPayload(data: unknown): RawObject[] {
  if (Array.isArray(data)) return data.map((item) => asRecord(item) || {});
  const wrapped = asRecord(data);
  if (wrapped && Array.isArray(wrapped.items)) {
    return wrapped.items.map((item) => asRecord(item) || {});
  }
  if (wrapped && Array.isArray(wrapped.entries)) {
    return wrapped.entries.map((item) => asRecord(item) || {});
  }
  if (wrapped && Array.isArray(wrapped.logbooks)) {
    return wrapped.logbooks.map((item) => asRecord(item) || {});
  }
  if (wrapped && Array.isArray(wrapped.data)) {
    return wrapped.data.map((item) => asRecord(item) || {});
  }
  return [];
}

function getDetailRouteKey(raw: RawObject, student: RawObject): string {
  return (
    getFirstString(student, ["id", "studentId", "userId"], "") ||
    getFirstString(raw, ["studentId", "userId"], "") ||
    getFirstString(student, ["nim", "studentNim"], "") ||
    getFirstString(raw, ["nim", "studentNim"], "") ||
    ""
  );
}

function mapRawDetail(data: unknown, fallbackStudentId: string): DosenLogbookMonitorByStudentItem {
  const wrapped = asRecord(data) || {};
  const student = asRecord(wrapped.student) || asRecord(wrapped.mahasiswa) || {};
  const items = getArrayPayload(wrapped);

  return {
    studentId: getFirstString(wrapped, ["studentId"], getFirstString(student, ["id", "studentId"], fallbackStudentId)),
    studentName: getFirstString(student, ["name", "nama", "studentName"], "-"),
    nim: getFirstString(student, ["nim", "studentNim"], "-"),
    email: getFirstString(student, ["email", "studentEmail"], "") || null,
    company: getFirstString(wrapped, ["company", "companyName", "instansi"], "-"),
    mentorId: getFirstString(wrapped, ["mentorId"], "") || null,
    logbooks: items.map((item, index) => mapRawItem(item, index)),
  };
}

function mapRawItem(raw: RawObject, index: number): DosenLogbookMonitorItem {
  const student = asRecord(raw.student) || asRecord(raw.mahasiswa) || {};
  const mentor = asRecord(raw.mentor) || {};
  const company = asRecord(raw.company) || asRecord(raw.perusahaan) || {};
  const detailRouteKey = getDetailRouteKey(raw, student);

  return {
    id: getFirstString(raw, ["id", "logbookId"], `logbook-${index}`),
    detailRouteKey,
    studentId: getFirstString(student, ["id", "studentId", "userId"], getFirstString(raw, ["studentId", "userId"], "")) || undefined,
    studentName: getFirstString(student, ["name", "nama", "studentName"], "-"),
    nim: getFirstString(student, ["nim", "studentNim"], "-"),
    company: getFirstString(raw, ["company", "companyName"], getFirstString(company, ["name", "nama"], "-")),
    date: getFirstString(raw, ["date", "tanggal", "createdAt"], "-"),
    activity: getFirstString(raw, ["activity", "kegiatan", "description"], "-"),
    status: normalizeStatus(getFirstString(raw, ["status", "logbookStatus"], "PENDING")),
    hours: Number.isFinite(Number(raw.hours)) ? Number(raw.hours) : undefined,
    rejectionReason: getFirstString(raw, ["rejectionReason", "reason", "catatan"], "") || undefined,
    mentorName: getFirstString(mentor, ["name", "nama", "mentorName"], getFirstString(raw, ["mentorName"], "")) || undefined,
    mentorId: getFirstString(raw, ["mentorId"], "") || undefined,
    studentEmail: getFirstString(student, ["email", "studentEmail"], "") || undefined,
  };
}

export async function getDosenLogbookMonitorItems(): Promise<ApiResponse<DosenLogbookMonitorItem[]>> {
  let lastMessage = "Endpoint monitoring logbook belum tersedia";

  for (const endpoint of LIST_ENDPOINTS) {
    const response = await apiClient<unknown>(endpoint);

    if (response.success) {
      const items = getArrayPayload(response.data).map((item, index) => mapRawItem(item, index));
      return {
        success: true,
        message: response.message,
        data: items,
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

export async function getDosenLogbookMonitorByStudent(
  studentId: string,
): Promise<ApiResponse<DosenLogbookMonitorByStudentItem>> {
  let lastMessage = "Endpoint detail monitoring logbook belum tersedia";

  for (const build of DETAIL_ENDPOINT_BUILDERS) {
    const response = await apiClient<unknown>(build(studentId));

    if (response.success) {
      return {
        success: true,
        message: response.message,
        data: mapRawDetail(response.data, studentId),
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
