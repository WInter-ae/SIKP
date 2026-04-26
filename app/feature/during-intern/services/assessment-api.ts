import { iget } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";

export interface StudentAssessmentData {
  id: string;
  studentId: string;
  mentorId: string;
  internshipId?: string;
  kehadiran: number;
  kerjasama: number;
  sikapEtika: number;
  prestasiKerja: number;
  kreatifitas: number;
  totalScore: number;
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
  feedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ASSESSMENT_ENDPOINTS = [
  "/api/mahasiswa/assessment/current",
  "/api/mahasiswa/penilaian/current",
  "/api/mahasiswa/assessment",
  "/api/mahasiswa/penilaian",
  "/api/mahasiswa/internship/current",
  "/api/mahasiswa/internship",
] as const;

function parseScoreValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    return (
      parseScoreValue(row.score) ??
      parseScoreValue(row.nilai) ??
      parseScoreValue(row.value) ??
      parseScoreValue(row.point) ??
      null
    );
  }
  return null;
}

function normalizeKey(input: string): string {
  return input.toLowerCase().replace(/[^a-z]/g, "");
}

function isCategoryMatch(key: string, aliases: string[]): boolean {
  const normalized = normalizeKey(key);
  return aliases.some((alias) => normalized.includes(alias));
}

function extractScoresFromMap(row: Record<string, unknown>) {
  const pairs = Object.entries(row);

  const readByAliases = (aliases: string[]): number | null => {
    for (const [key, value] of pairs) {
      if (isCategoryMatch(key, aliases)) {
        const parsed = parseScoreValue(value);
        if (parsed !== null) return parsed;
      }
    }
    return null;
  };

  return {
    kehadiran: readByAliases(["kehadiran", "attendance", "hadir", "disiplin"]),
    kerjasama: readByAliases(["kerjasama", "cooperation", "teamwork"]),
    sikapEtika: readByAliases(["sikap", "etika", "attitude", "ethics"]),
    prestasiKerja: readByAliases([
      "prestasi",
      "workachievement",
      "kinerja",
      "hasilkerja",
    ]),
    kreatifitas: readByAliases(["kreatif", "kreativ", "creativ", "inovasi"]),
  };
}

function extractScoresFromCategoryList(
  payload: unknown,
): Partial<StudentAssessmentData> | null {
  if (!Array.isArray(payload)) return null;

  const scores: Partial<StudentAssessmentData> = {};

  payload.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const row = item as Record<string, unknown>;
    const categoryRaw = String(
      row.category || row.label || row.name || row.kriteria || "",
    );
    const category = normalizeKey(categoryRaw);
    const score = parseScoreValue(
      row.score ?? row.nilai ?? row.value ?? row.point,
    );
    if (score === null) return;

    if (category.includes("kehadiran") || category.includes("attendance"))
      scores.kehadiran = score;
    else if (
      category.includes("kerjasama") ||
      category.includes("cooperation") ||
      category.includes("teamwork")
    )
      scores.kerjasama = score;
    else if (
      category.includes("sikap") ||
      category.includes("etika") ||
      category.includes("attitude") ||
      category.includes("ethics")
    )
      scores.sikapEtika = score;
    else if (
      category.includes("prestasi") ||
      category.includes("workachievement") ||
      category.includes("kinerja")
    )
      scores.prestasiKerja = score;
    else if (
      category.includes("kreatif") ||
      category.includes("kreativ") ||
      category.includes("creativ") ||
      category.includes("inovasi")
    )
      scores.kreatifitas = score;
  });

  const hasAny =
    typeof scores.kehadiran === "number" ||
    typeof scores.kerjasama === "number" ||
    typeof scores.sikapEtika === "number" ||
    typeof scores.prestasiKerja === "number" ||
    typeof scores.kreatifitas === "number";

  return hasAny ? scores : null;
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

  const normalizedAliases = aliases.map((alias) => normalizeKey(alias));
  for (const component of components) {
    const ref =
      normalizeKey(String(component.categoryKey || "")) ||
      normalizeKey(String(component.categoryId || "")) ||
      normalizeKey(String(component.label || ""));
    if (!ref) continue;

    const matched = normalizedAliases.some((alias) => ref.includes(alias));
    if (!matched) continue;

    const parsed = Number(component.score ?? 0);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function normalizeAssessmentPayload(
  payload: unknown,
): StudentAssessmentData | null {
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
  );
  const extracted = extractScoresFromMap(row);
  const fromList =
    extractScoresFromCategoryList(row.details) ||
    extractScoresFromCategoryList(row.scores) ||
    extractScoresFromCategoryList(row.kriteria) ||
    extractScoresFromCategoryList(row.items) ||
    extractScoresFromCategoryList(row.penilaianDetail) ||
    null;

  const kehadiran = Number(
    row.kehadiran ??
      row.attendance ??
      row.nilaiKehadiran ??
      extracted.kehadiran ??
      fromList?.kehadiran ??
      scoreFromComponents(parsedComponents, ["kehadiran", "attendance"]) ??
      0,
  );
  const kerjasama = Number(
    row.kerjasama ??
      row.cooperation ??
      row.nilaiKerjasama ??
      extracted.kerjasama ??
      fromList?.kerjasama ??
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
      row.etika ??
      row.attitudeEthics ??
      row.attitude_ethics ??
      row.attitude ??
      row.ethics ??
      row.nilaiSikapEtika ??
      row.nilai_sikap_etika ??
      extracted.sikapEtika ??
      fromList?.sikapEtika ??
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
      extracted.prestasiKerja ??
      fromList?.prestasiKerja ??
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
      extracted.kreatifitas ??
      fromList?.kreatifitas ??
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
        row.studentId || row.studentUserId || row.student_id || "",
      ),
      mentorId: String(row.mentorId || row.mentor_id || ""),
      internshipId:
        typeof row.internshipId === "string" ? row.internshipId : undefined,
      kehadiran,
      kerjasama,
      sikapEtika,
      prestasiKerja,
      kreatifitas,
      totalScore: Number(row.totalScore ?? row.finalScore ?? 0),
      components: parsedComponents || undefined,
      feedback:
        typeof row.feedback === "string"
          ? row.feedback
          : typeof row.catatan === "string"
            ? row.catatan
            : undefined,
      createdAt:
        typeof row.createdAt === "string"
          ? row.createdAt
          : typeof row.created_at === "string"
            ? row.created_at
            : undefined,
      updatedAt:
        typeof row.updatedAt === "string"
          ? row.updatedAt
          : typeof row.updated_at === "string"
            ? row.updated_at
            : undefined,
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
    row.internshipData,
    row.mahasiswa,
  ];

  const internshipCandidate =
    row.internship && typeof row.internship === "object"
      ? (row.internship as Record<string, unknown>)
      : null;
  if (internshipCandidate) {
    nestedCandidates.push(
      internshipCandidate.assessment,
      internshipCandidate.penilaian,
      internshipCandidate.nilai,
      internshipCandidate.scoring,
    );
  }

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

function isDedicatedAssessmentEndpoint(endpoint: string): boolean {
  return (
    endpoint.includes("/mahasiswa/assessment") ||
    endpoint.includes("/mahasiswa/penilaian")
  );
}

/**
 * Get assessment for currently logged-in mahasiswa.
 * Backend contract: dedicated endpoint may return success=true with data=null when no assessment exists.
 */
export async function getMyAssessment(): Promise<
  ApiResponse<StudentAssessmentData | null>
> {
  let lastMessage = "Data penilaian belum tersedia.";

  for (const endpoint of ASSESSMENT_ENDPOINTS) {
    const response = await iget<unknown>(endpoint);

    if (!response.success) {
      lastMessage = response.message || lastMessage;
      continue;
    }

    const payload = response.data;
    if (payload === null || payload === undefined) {
      if (isDedicatedAssessmentEndpoint(endpoint)) {
        return {
          success: true,
          message: response.message || "Belum ada penilaian.",
          data: null,
        };
      }

      lastMessage = response.message || lastMessage;
      continue;
    }

    const normalized = normalizeAssessmentPayload(payload);
    if (normalized) {
      return {
        success: true,
        message: response.message || "Data penilaian berhasil diambil.",
        data: normalized,
      };
    }

    lastMessage = response.message || lastMessage;
  }

  return {
    success: false,
    message: lastMessage,
    data: null,
  };
}
