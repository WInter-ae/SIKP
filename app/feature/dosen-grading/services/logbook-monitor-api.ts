import { internshipClient, INTERNSHIP_API_BASE_URL } from "~/lib/api-client";
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
  totalApproved?: number;
  totalPending?: number;
  rejectionReason?: string;
  mentorName?: string;
  mentorId?: string;
  studentEmail?: string;
  photoUrl?: string | null;
  photo_url?: string | null;
  time?: string;
  approvedTime?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface DosenLogbookMonitorByStudentItem {
  studentId: string;
  studentName: string;
  nim: string;
  email?: string | null;
  company: string;
  programStudi?: string;
  division?: string;
  startDate?: string | null;
  endDate?: string | null;
  mentorId?: string | null;
  logbooks: DosenLogbookMonitorItem[];
}

type RawObject = Record<string, unknown>;

const LIST_ENDPOINTS = [
  "/api/internship-monitoring/mentees",
  "/api/internship-monitoring/logbook", // Fallback for backward compatibility
  "/api/mentorship/logbook-monitor",
] as const;

const DETAIL_ENDPOINT_BUILDERS = [
  (studentId: string) => `/api/internship-monitoring/mentees/${studentId}/logbooks`,
  (studentId: string) => `/api/internship-monitoring/logbook/${studentId}`,
] as const;

const INACTIVE_ENDPOINT = "/api/internship-monitoring/inactive";
const EXPORT_ZIP_ENDPOINT =
  "/api/internship-monitoring/logbooks/export";

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
    if (value === null || value === undefined) continue;
    
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value !== "object") return String(value);
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
  return (
    lower.includes("404") ||
    lower.includes("not found") ||
    lower.includes("tidak ditemukan")
  );
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
    getFirstString(raw, ["studentId", "userId", "mahasiswaId"], "") ||
    getFirstString(student, ["nim", "studentNim"], "") ||
    getFirstString(raw, ["nim", "studentNim"], "") ||
    ""
  );
}

function mapRawDetail(
  data: unknown,
  fallbackStudentId: string,
): DosenLogbookMonitorByStudentItem {
  const wrapped = asRecord(data) || {};
  const student =
    asRecord(wrapped.student) || asRecord(wrapped.mahasiswa) || {};
  const items = getArrayPayload(wrapped);

  return {
    studentId: getFirstString(
      wrapped,
      ["studentId"],
      getFirstString(student, ["id", "studentId"], fallbackStudentId),
    ),
    studentName: getFirstString(
      wrapped,
      ["studentName", "name", "nama"],
      getFirstString(student, ["name", "nama", "studentName"], "-"),
    ),
    nim: getFirstString(
      wrapped,
      ["nim", "studentNim"],
      getFirstString(student, ["nim", "studentNim"], "-"),
    ),
    email: getFirstString(
      wrapped,
      ["email", "studentEmail"],
      getFirstString(student, ["email", "studentEmail"], "") || "",
    ) || null,
    company: getFirstString(
      wrapped,
      ["company", "companyName", "instansi"],
      "-",
    ),
    programStudi: getFirstString(wrapped, ["programStudi", "prodi"], "-"),
    division: getFirstString(wrapped, ["division", "bidang"], "-"),
    startDate: getFirstString(wrapped, ["startDate"], ""),
    endDate: getFirstString(wrapped, ["endDate"], ""),
    mentorId: getFirstString(wrapped, ["mentorId"], "") || null,
    logbooks: items.map((item, index) => mapRawLogbookItem(item, index)),
  };
}

function mapRawMenteeItem(raw: RawObject, index: number): DosenLogbookMonitorItem {
  const student = asRecord(raw.student) || asRecord(raw.mahasiswa) || {};
  const stats = asRecord(raw.stats) || {};
  const company = asRecord(raw.company) || asRecord(raw.perusahaan) || {};
  
  const studentName = getFirstString(raw, ["studentName"], getFirstString(student, ["name", "nama", "studentName"], "-"));
  const nim = getFirstString(raw, ["nim"], getFirstString(student, ["nim", "studentNim"], "-"));
  const companyName = getFirstString(raw, ["companyName"], getFirstString(raw, ["company"], getFirstString(company, ["name", "nama"], "-")));
  const lastUpdate = getFirstString(stats, ["lastLogbookDate"], getFirstString(raw, ["date", "tanggal", "lastLogbookDate"], "-"));
  const totalApproved = Number(stats.totalApproved || 0);
  const totalPending = Number(stats.totalPending || 0);

  const detailRouteKey = getDetailRouteKey(raw, student);

  return {
    id: getFirstString(raw, ["id", "internshipId", "logbookId"], `item-${index}`),
    detailRouteKey,
    studentId:
      getFirstString(
        raw,
        ["mahasiswaId", "studentId", "userId"],
        getFirstString(student, ["id", "studentId", "userId"], "")
      ) || undefined,
    studentName,
    nim,
    company: companyName,
    date: lastUpdate === "-" ? "Belum ada entri" : lastUpdate,
    activity: `${totalApproved} Disetujui, ${totalPending} Menunggu`,
    status: totalPending > 0 ? "PENDING" : (totalApproved > 0 ? "APPROVED" : "PENDING"),
    hours: Number.isFinite(Number(stats.totalHours)) ? Number(stats.totalHours) : undefined,
    totalApproved,
    totalPending,
    mentorName: getFirstString(raw, ["mentorName"], ""),
    startDate: getFirstString(raw, ["startDate"], "") || null,
    endDate: getFirstString(raw, ["endDate"], "") || null,
  };
}

function mapRawLogbookItem(raw: RawObject, index: number): DosenLogbookMonitorItem {
  return {
    id: getFirstString(raw, ["id", "logbookId"], `logbook-${index}`),
    detailRouteKey: "", // Not needed for detail items
    studentId: undefined,
    studentName: "-",
    nim: "-",
    company: "-",
    date: getFirstString(raw, ["date", "tanggal", "createdAt"], "-"),
    activity: getFirstString(raw, ["activity", "kegiatan", "description"], "-"),
    status: normalizeStatus(getFirstString(raw, ["status", "logbookStatus"], "PENDING")),
    hours: Number.isFinite(Number(raw.hours)) ? Number(raw.hours) : undefined,
    rejectionReason: getFirstString(raw, ["rejectionReason", "reason", "catatan"], "") || undefined,
    photoUrl: getFirstString(raw, ["photoUrl", "photo_url"], "") || null,
    mentorName: getFirstString(raw, ["mentorName"], "-"),
    time: raw.createdAt ? new Date(raw.createdAt as string).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
    approvedTime: raw.verifiedAt ? new Date(raw.verifiedAt as string).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
  };
}

function resolveFileName(contentDisposition: string | null) {
  if (!contentDisposition) return "logbook_pa.zip";
  const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return match?.[1] || "logbook_pa.zip";
}

export async function getDosenLogbookMonitorItems(): Promise<
  ApiResponse<DosenLogbookMonitorItem[]>
> {
  let lastMessage = "Endpoint monitoring logbook belum tersedia";

  for (const endpoint of LIST_ENDPOINTS) {
    const response = await internshipClient.request<unknown>(endpoint);

    if (response.success) {
      const items = getArrayPayload(response.data).map((item, index) =>
        mapRawMenteeItem(item, index),
      );
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

export async function exportLogbookZip(): Promise<
  ApiResponse<{ blob: Blob; fileName: string }>
> {
  try {
    const response = await fetch(
      `${INTERNSHIP_API_BASE_URL}${EXPORT_ZIP_ENDPOINT}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    if (!response.ok) {
      let message = "Gagal menyiapkan arsip logbook.";
      try {
        const payload = (await response.json()) as ApiResponse<unknown>;
        message = payload.message || message;
      } catch {
        // Ignore JSON parse errors for non-JSON response.
      }
      return { success: false, message, data: null };
    }

    const blob = await response.blob();
    const fileName = resolveFileName(
      response.headers.get("content-disposition"),
    );

    return {
      success: true,
      message: "Logbook ZIP siap diunduh",
      data: { blob, fileName },
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat mengunduh logbook.";
    return { success: false, message, data: null };
  }
}

export async function getDosenLogbookMonitorByStudent(
  studentId: string,
): Promise<ApiResponse<DosenLogbookMonitorByStudentItem>> {
  let lastMessage = "Endpoint detail monitoring logbook belum tersedia";

  for (const build of DETAIL_ENDPOINT_BUILDERS) {
    const response = await internshipClient.request<unknown>(build(studentId));

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

export async function getInactiveMentees(): Promise<ApiResponse<DosenLogbookMonitorItem[]>> {
  const response = await internshipClient.get<unknown>(INACTIVE_ENDPOINT);
  
  if (response.success) {
    const items = getArrayPayload(response.data).map((item, index) =>
      mapRawMenteeItem(item, index),
    );
    return {
      success: true,
      message: response.message,
      data: items,
    };
  }

  return {
    success: false,
    message: response.message || "Gagal mengambil data mahasiswa inaktif.",
    data: [],
  };
}

export async function syncMenteesProgress(): Promise<ApiResponse<{ synced: number }>> {
  return await internshipClient.post<{ synced: number }>("/api/internship-monitoring/sync");
}
