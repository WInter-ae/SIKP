/**
 * Mentor API Service
 * Handles all mentor (pembimbing lapangan) related API calls
 */

import { internshipClient } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import {
  getActiveProfileSignature,
  getSignatureManageUrl,
} from "~/lib/services/signature.service";

// ==================== TYPES ====================

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  position: string;
  address?: string;
  signature?: string; // Base64 signature - setup once
  signatureSetAt?: string; // When signature was created/updated
  createdAt: string;
  updatedAt: string;
}

export interface MenteeData {
  // Dari docs GET /api/mentor/mentees
  userId: string;
  nama: string;
  email: string;
  phone?: string;
  nim: string;
  prodi: string;
  fakultas: string;
  semester: number;
  angkatan: string;
  internshipId: string;
  internshipStatus: string;
  internshipStartDate: string;
  internshipEndDate: string;
  companyName: string;
  division: string;
  // Alias backward compat
  id?: string;
  name?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  progress?: number;
}

export interface LogbookEntry {
  id: string;
  studentId: string;
  date: string;
  activity: string;
  description: string;
  mentorSignature?: string;
  mentorSignedAt?: string;
  photoUrl?: string | null;
  photo_url?: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentData {
  id: string;
  studentId: string;
  mentorId: string;
  kehadiran: number; // 0-100
  kerjasama: number; // 0-100
  sikapEtika: number; // 0-100
  prestasiKerja: number; // 0-100
  kreatifitas: number; // 0-100
  totalScore: number; // Weighted average
  feedback?: string;
  components?: Array<{
    id?: string;
    categoryId: string;
    categoryKey?: string;
    label?: string;
    weight: number;
    maxScore?: number;
    score: number;
    weightedScore: number;
    sortOrder?: number;
  }>;
  isLocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

type AssessmentComponentPayload = {
  categoryId: string;
  score: number;
};

function normalizeCategoryKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function scoreFromComponents(
  components: Array<{
    categoryId?: string;
    categoryKey?: string;
    label?: string;
    score?: number;
  }> | null,
  aliases: string[],
): number | null {
  if (!components || components.length === 0) return null;

  const aliasSet = aliases.map((alias) => normalizeCategoryKey(alias));
  for (const component of components) {
    const categoryRef =
      normalizeCategoryKey(String(component.categoryKey || "")) ||
      normalizeCategoryKey(String(component.categoryId || "")) ||
      normalizeCategoryKey(String(component.label || ""));
    if (!categoryRef) continue;

    const matched = aliasSet.some((alias) => categoryRef.includes(alias));
    if (!matched) continue;

    const parsed = Number(component.score ?? 0);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function normalizeAssessmentPayload(payload: unknown): AssessmentData | null {
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const parsed = normalizeAssessmentPayload(item);
      if (parsed) return parsed;
    }
    return null;
  }

  if (!payload || typeof payload !== "object") return null;

  const row = payload as Record<string, unknown>;

  const rawComponents = Array.isArray(row.components)
    ? (row.components as Record<string, unknown>[])
    : Array.isArray(
          (row.data as Record<string, unknown> | undefined)?.components,
        )
      ? ((row.data as Record<string, unknown>).components as Record<
          string,
          unknown
        >[])
      : null;

  const parsedComponents = rawComponents
    ? rawComponents.map((component) => ({
        id: typeof component.id === "string" ? component.id : undefined,
        categoryId: String(
          component.categoryId ||
            component.category_id ||
            component.categoryKey ||
            "",
        ),
        categoryKey:
          typeof component.categoryKey === "string"
            ? component.categoryKey
            : undefined,
        label:
          typeof component.label === "string" ? component.label : undefined,
        weight: Number(component.weight ?? 0),
        maxScore: Number(component.maxScore ?? component.max_score ?? 100),
        score: Number(component.score ?? 0),
        weightedScore: Number(
          component.weightedScore ?? component.weighted_score ?? 0,
        ),
        sortOrder: Number(component.sortOrder ?? component.sort_order ?? 0),
      }))
    : null;

  const directId = String(
    row.id || row.assessmentId || row.assessment_id || "",
  ).trim();
  const kehadiran = Number(
    row.kehadiran ??
      row.attendance ??
      row.nilaiKehadiran ??
      scoreFromComponents(parsedComponents, ["kehadiran", "attendance"]) ??
      0,
  );
  const kerjasama = Number(
    row.kerjasama ??
      row.cooperation ??
      row.nilaiKerjasama ??
      scoreFromComponents(parsedComponents, [
        "kerjasama",
        "cooperation",
        "teamwork",
      ]) ??
      0,
  );
  const sikapEtika = Number(
    row.sikapEtika ??
      row.sikap_etika ??
      row.sikapDanEtika ??
      row.sikap_dan_etika ??
      row.sikapEtikaTingkahLaku ??
      row.sikap_etika_tingkah_laku ??
      row.attitudeEthics ??
      row.attitude_ethics ??
      row.attitude ??
      row.ethics ??
      row.nilaiSikapEtika ??
      row.nilai_sikap_etika ??
      scoreFromComponents(parsedComponents, [
        "sikap",
        "etika",
        "attitude",
        "ethics",
      ]) ??
      0,
  );
  const prestasiKerja = Number(
    row.prestasiKerja ??
      row.prestasi_kerja ??
      row.workAchievement ??
      row.nilaiPrestasiKerja ??
      scoreFromComponents(parsedComponents, [
        "prestasi",
        "workachievement",
        "kinerja",
      ]) ??
      0,
  );
  const kreatifitas = Number(
    row.kreatifitas ??
      row.kreativitas ??
      row.creativity ??
      row.nilaiKreatifitas ??
      scoreFromComponents(parsedComponents, [
        "kreatif",
        "kreativ",
        "creativ",
        "inovasi",
      ]) ??
      0,
  );

  const hasScores = Boolean(
    kehadiran || kerjasama || sikapEtika || prestasiKerja || kreatifitas,
  );

  if (directId || hasScores) {
    return {
      id: directId || "assessment",
      studentId: String(
        row.studentId ||
          row.studentUserId ||
          row.student_id ||
          row.userId ||
          "",
      ),
      mentorId: String(row.mentorId || row.mentor_id || row.mentorUserId || ""),
      kehadiran,
      kerjasama,
      sikapEtika,
      prestasiKerja,
      kreatifitas,
      totalScore: Number(
        row.totalScore ?? row.finalScore ?? row.nilaiAkhir ?? 0,
      ),
      feedback:
        typeof row.feedback === "string"
          ? row.feedback
          : typeof row.catatan === "string"
            ? row.catatan
            : undefined,
      createdAt:
        typeof row.createdAt === "string"
          ? row.createdAt
          : new Date().toISOString(),
      updatedAt:
        typeof row.updatedAt === "string"
          ? row.updatedAt
          : new Date().toISOString(),
      isLocked: Boolean(row.isLocked ?? row.is_locked ?? false),
      components: parsedComponents || undefined,
    };
  }

  const nestedCandidates = [
    row.data,
    row.assessment,
    row.penilaian,
    row.result,
    row.item,
    row.items,
    row.internship,
  ];

  for (const candidate of nestedCandidates) {
    const parsed = normalizeAssessmentPayload(candidate);
    if (parsed) return parsed;
  }

  for (const value of Object.values(row)) {
    if (!value || typeof value !== "object") continue;
    const parsed = normalizeAssessmentPayload(value);
    if (parsed) return parsed;
  }

  return null;
}

// ==================== API FUNCTIONS ====================

/**
 * Get mentor profile (current logged in mentor)
 * GET /api/mentor/profile
 */
export async function getMentorProfile(): Promise<ApiResponse<MentorProfile>> {
  const response = await internshipClient.get<any>("/api/mentorship/profile");
  
  if (response.success && response.data) {
    const raw = response.data;
    // Map backend fields to frontend fields
    const mapped: MentorProfile = {
      ...raw,
      name: raw.name || raw.fullName || raw.nama || "-",
      company: raw.company || raw.instansi || raw.perusahaan || "-",
      position: raw.position || raw.jabatan || "-",
    };
    return { ...response, data: mapped };
  }
  
  return response;
}

/**
 * Update mentor profile
 * PUT /api/mentor/profile
 */
export async function updateMentorProfile(
  data: Partial<
    Omit<MentorProfile, "id" | "userId" | "createdAt" | "updatedAt">
  >,
): Promise<ApiResponse<MentorProfile>> {
  return internshipClient.put<MentorProfile>("/api/mentorship/profile", data);
}

/**
 * Get all mentees (mahasiswa bimbingan) for current mentor
 * GET /api/mentor/mentees
 */
export async function getMentees(): Promise<ApiResponse<MenteeData[]>> {
  return internshipClient.get<MenteeData[]>("/api/mentorship/mentees");
}

/**
 * Get single mentee detail
 * GET /api/mentor/mentees/:studentId
 */
export async function getMenteeDetail(
  studentId: string,
): Promise<ApiResponse<MenteeData>> {
  return internshipClient.get<MenteeData>(`/api/mentorship/mentees/${studentId}`);
}

/**
 * Get student logbook for current mentor
 * GET /api/mentor/logbook/:studentId
 */
export async function getStudentLogbook(
  studentId: string,
): Promise<ApiResponse<LogbookEntry[]>> {
  return internshipClient.get<LogbookEntry[]>(`/api/mentorship/mentees/${studentId}/logbooks`);
}

/**
 * Approve (paraf) logbook entry
 * Uses signature from mentor profile (no need to sign again)
 * POST /api/mentor/logbook/:logbookId/approve
 */
export async function approveLogbook(
  logbookId: string,
): Promise<ApiResponse<LogbookEntry>> {
  return internshipClient.post<LogbookEntry>(`/api/mentorship/logbooks/${logbookId}/approve`, {});
}

/**
 * Reject logbook entry with rejection note
 * POST /api/mentor/logbook/:logbookId/reject
 */
export async function rejectLogbook(
  logbookId: string,
  rejectionReason: string,
): Promise<ApiResponse<LogbookEntry>> {
  return internshipClient.post<LogbookEntry>(`/api/mentorship/logbooks/${logbookId}/reject`, {
    rejectionReason,
  });
}

/**
 * Approve all pending logbooks for a student
 * Uses signature from mentor profile (no need to sign again)
 * POST /api/mentor/logbook/:studentId/approve-all
 */
export async function approveAllLogbooks(
  studentId: string,
): Promise<ApiResponse<{ message: string; internshipId: string }>> {
  return internshipClient.post<{ message: string; internshipId: string }>(
    `/api/mentorship/mentees/${studentId}/approve-all`,
    {},
  );
}

/**
 * Submit assessment (penilaian) for a student
 * POST /api/mentor/assessment
 */
export async function submitAssessment(data: {
  studentUserId: string;
  components?: AssessmentComponentPayload[];
  kehadiran: number;
  kerjasama: number;
  sikapEtika: number;
  prestasiKerja: number;
  kreatifitas: number;
  feedback?: string;
}): Promise<ApiResponse<AssessmentData>> {
  const componentPayload =
    data.components && data.components.length > 0
      ? data.components.map((component) => ({
          categoryId: component.categoryId,
          score: component.score,
        }))
      : undefined;

  const payload = {
    studentUserId: data.studentUserId,
    ...(componentPayload ? { components: componentPayload } : {}),
    kehadiran: data.kehadiran,
    kerjasama: data.kerjasama,
    sikapEtika: data.sikapEtika,
    prestasiKerja: data.prestasiKerja,
    kreatifitas: data.kreatifitas,
    feedback: data.feedback,
    sikap_etika: data.sikapEtika,
    sikapDanEtika: data.sikapEtika,
    sikapEtikaTingkahLaku: data.sikapEtika,
    attitudeEthics: data.sikapEtika,
  };

  const response = await internshipClient.post<unknown>("/api/mentorship/assessments", payload);

  if (!response.success) {
    return response as ApiResponse<AssessmentData>;
  }

  const normalized = normalizeAssessmentPayload(response.data);
  return {
    success: true,
    message: response.message,
    data: normalized ?? (response.data as AssessmentData),
  };
}

/**
 * Get assessment for a student
 * GET /api/mentor/assessment/:studentId
 */
export async function getStudentAssessment(
  studentId: string,
): Promise<ApiResponse<AssessmentData>> {
  const endpoints = [
    `/api/mentorship/assessments/${studentId}`,
  ];

  let lastMessage = "Gagal mengambil data penilaian mahasiswa.";

  for (const endpoint of endpoints) {
    const response = await internshipClient.get<unknown>(endpoint);

    if (!response.success) {
      lastMessage = response.message || lastMessage;
      continue;
    }

    const normalized = normalizeAssessmentPayload(response.data);
    if (normalized) {
      return {
        success: true,
        message: response.message,
        data: normalized,
      };
    }

    return {
      success: true,
      message: response.message,
      data: response.data as AssessmentData,
    };
  }

  return {
    success: false,
    message: lastMessage,
    data: null,
  };
}

/**
 * Update existing assessment
 * PUT /api/mentor/assessment/:assessmentId
 */
export async function updateAssessment(
  assessmentId: string,
  data: Partial<
    Omit<
      AssessmentData,
      | "id"
      | "studentId"
      | "mentorId"
      | "createdAt"
      | "updatedAt"
      | "totalScore"
      | "components"
    >
  > & {
    components?: AssessmentComponentPayload[];
  },
): Promise<ApiResponse<AssessmentData>> {
  const componentPayload =
    data.components && data.components.length > 0
      ? data.components.map((component) => ({
          categoryId: component.categoryId,
          score: component.score,
        }))
      : undefined;

  const payload = {
    ...data,
    ...(componentPayload ? { components: componentPayload } : {}),
    ...(typeof data.sikapEtika === "number"
      ? {
          sikap_etika: data.sikapEtika,
          sikapDanEtika: data.sikapEtika,
          sikapEtikaTingkahLaku: data.sikapEtika,
          attitudeEthics: data.sikapEtika,
        }
      : {}),
  };

  const response = await internshipClient.put<unknown>(
    `/api/mentorship/assessments/${assessmentId}`,
    payload,
  );

  if (!response.success) {
    return response as ApiResponse<AssessmentData>;
  }

  const normalized = normalizeAssessmentPayload(response.data);
  return {
    success: true,
    message: response.message,
    data: normalized ?? (response.data as AssessmentData),
  };
}

/**
 * Unlock assessment for editing
 * POST /api/mentorship/assessments/:assessmentId/unlock
 */
export async function unlockAssessment(
  assessmentId: string,
): Promise<ApiResponse<AssessmentData>> {
  const response = await internshipClient.post<unknown>(
    `/api/mentorship/assessments/${assessmentId}/unlock`,
    {},
  );

  if (!response.success) {
    return response as ApiResponse<AssessmentData>;
  }

  const normalized = normalizeAssessmentPayload(response.data);
  return {
    success: true,
    message: response.message,
    data: normalized ?? (response.data as AssessmentData),
  };
}

/**
 * Upload tanda tangan mentor ke profil
 * POST /api/mentorship/profile/signature
 * Field name: "file" (Max 2MB, JPEG/PNG)
 */
export async function uploadMentorSignature(
  file: File,
): Promise<ApiResponse<{ signatureUrl: string }>> {
  const formData = new FormData();
  formData.append("file", file);
  return internshipClient.upload<{ signatureUrl: string }>(
    "/api/mentorship/profile/signature",
    formData,
  );
}

/**
 * Redirect ke SSO untuk kelola tanda tangan (fallback UI helper)
 * Tidak memanggil backend secara langsung.
 */
export async function saveMentorSignature(signatureData?: string): Promise<
  ApiResponse<MentorProfile>
> {
  const manageUrlResponse = await getSignatureManageUrl();
  if (!manageUrlResponse.success || !manageUrlResponse.data) {
    return {
      success: false,
      message:
        manageUrlResponse.message ||
        "Kelola tanda tangan hanya tersedia di SSO.",
      data: null,
    };
  }

  return {
    success: false,
    message: `Kelola tanda tangan di SSO: ${manageUrlResponse.data}`,
    data: null,
  };
}

/**
 * Get mentor signature from profile
 * GET /api/mentorship/signature
 */
export async function getMentorSignature(): Promise<
  ApiResponse<{ signature?: string; signatureSetAt?: string }>
> {
  const response = await getActiveProfileSignature();

  if (!response.success) {
    return {
      success: false,
      message: response.message,
      data: null,
    };
  }

  return {
    success: true,
    message: response.message,
    data: response.data
      ? {
          signature: response.data.signatureImage,
          signatureSetAt: response.data.uploadedAt,
        }
      : {},
  };
}

/**
 * Delete mentor signature from profile
 * DELETE /api/mentorship/signature (via SSO redirect)
 */
export async function deleteMentorSignature(): Promise<
  ApiResponse<{ success: boolean }>
> {
  const manageUrlResponse = await getSignatureManageUrl();
  if (!manageUrlResponse.success || !manageUrlResponse.data) {
    return {
      success: false,
      message:
        manageUrlResponse.message ||
        "Kelola tanda tangan hanya tersedia di SSO.",
      data: null,
    };
  }

  return {
    success: false,
    message: `Kelola tanda tangan di SSO: ${manageUrlResponse.data}`,
    data: null,
  };
}


