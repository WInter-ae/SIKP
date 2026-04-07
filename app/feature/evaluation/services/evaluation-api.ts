import { apiClient, INTERNSHIP_API_BASE_URL } from "~/lib/api-client";
import type { ApiResponse } from "~/lib/api-client";
import type {
  AcademicSupervisorGrade,
  EvaluationSummary,
  FieldSupervisorGrade,
  GradeComponent,
  StudentEvaluation,
} from "../types";
import type { AssessmentCriterion } from "~/lib/assessment-criteria-api";

type CriterionKey = "kehadiran" | "kerjasama" | "sikapEtika" | "prestasiKerja" | "kreatifitas";

const ADMIN_LIST_ENDPOINTS = [
  "/api/admin/penilaian",
  "/api/admin/assessment",
  "/api/admin/evaluations",
  "/api/admin/penilaian/mahasiswa",
] as const;

const ADMIN_DETAIL_ENDPOINTS = [
  "/api/admin/penilaian",
  "/api/admin/assessment",
  "/api/admin/evaluations",
] as const;

function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeText(value: unknown, fallback = "-"): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCriterionKey(criterion: Pick<AssessmentCriterion, "id" | "category">): CriterionKey | null {
  const idKey = normalizeKey(String(criterion.id || ""));
  const categoryKey = normalizeKey(criterion.category || "");

  if (idKey === "1" || idKey.includes("kehadiran") || idKey.includes("attendance")) return "kehadiran";
  if (idKey === "2" || idKey.includes("kerjasama") || idKey.includes("cooperation")) return "kerjasama";
  if (idKey === "3" || idKey.includes("sikap") || idKey.includes("etika") || idKey.includes("attitude")) return "sikapEtika";
  if (idKey === "4" || idKey.includes("prestasi") || idKey.includes("workachievement") || idKey.includes("kinerja")) return "prestasiKerja";
  if (idKey === "5" || idKey.includes("kreatif") || idKey.includes("creativ")) return "kreatifitas";

  if (categoryKey.includes("kehadiran") || categoryKey.includes("attendance")) return "kehadiran";
  if (categoryKey.includes("kerjasama") || categoryKey.includes("cooperation")) return "kerjasama";
  if (categoryKey.includes("sikap") || categoryKey.includes("etika") || categoryKey.includes("attitude")) return "sikapEtika";
  if (categoryKey.includes("prestasi") || categoryKey.includes("workachievement") || categoryKey.includes("kinerja")) return "prestasiKerja";
  if (categoryKey.includes("kreatif") || categoryKey.includes("kreativ") || categoryKey.includes("creativ") || categoryKey.includes("inovasi")) return "kreatifitas";

  return null;
}

function gradeFromScore(score: number): string {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 55) return "D";
  return "E";
}

function statusFromScore(score: number): EvaluationSummary["status"] {
  return score >= 60 ? "passed" : "failed";
}

function scoreFromAssessment(assessment: Record<string, unknown>, key: CriterionKey): number {
  if (key === "kehadiran") return parseNumber(assessment.kehadiran ?? assessment.attendance ?? assessment.nilaiKehadiran);
  if (key === "kerjasama") return parseNumber(assessment.kerjasama ?? assessment.cooperation ?? assessment.nilaiKerjasama);
  if (key === "sikapEtika") {
    return parseNumber(
      assessment.sikapEtika ??
        assessment.sikap_etika ??
        assessment.sikapDanEtika ??
        assessment.attitudeEthics ??
        assessment.nilaiSikapEtika
    );
  }
  if (key === "prestasiKerja") {
    return parseNumber(
      assessment.prestasiKerja ??
        assessment.prestasi_kerja ??
        assessment.workAchievement ??
        assessment.nilaiPrestasiKerja
    );
  }
  return parseNumber(assessment.kreatifitas ?? assessment.kreativitas ?? assessment.creativity ?? assessment.nilaiKreatifitas);
}

function buildFieldGrades(
  criteria: AssessmentCriterion[],
  assessment: Record<string, unknown>
): { components: GradeComponent[]; totalScore: number; maxScore: number } {
  const components = criteria.map((criterion) => {
    const key = getCriterionKey(criterion);
    const score = key ? scoreFromAssessment(assessment, key) : 0;
    const name = key ? criterion.category : `${criterion.category} (Belum Sinkron Backend)`;

    return {
      name,
      score,
      maxScore: criterion.maxScore,
      weight: criterion.weight,
    } satisfies GradeComponent;
  });

  const supportedCriteria = criteria.filter((criterion) => Boolean(getCriterionKey(criterion)));

  const totalScore = supportedCriteria.reduce((sum, criterion) => {
    const key = getCriterionKey(criterion);
    if (!key) return sum;
    const weight = criterion.weight || 0;
    return sum + (scoreFromAssessment(assessment, key) * weight) / 100;
  }, 0);

  const maxScore =
    supportedCriteria.reduce((sum, criterion) => sum + (criterion.maxScore * criterion.weight) / 100, 0) || 100;

  return { components, totalScore, maxScore };
}

function pickFirstObject(payload: unknown): Record<string, unknown> | null {
  if (!payload) return null;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = pickFirstObject(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof payload !== "object") return null;

  const row = payload as Record<string, unknown>;
  if (Object.keys(row).length > 0) return row;

  for (const value of Object.values(row)) {
    const found = pickFirstObject(value);
    if (found) return found;
  }

  return null;
}

function extractRows(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => !!item && typeof item === "object");
  }

  if (!payload || typeof payload !== "object") return [];

  const row = payload as Record<string, unknown>;
  const candidates = [row.data, row.items, row.rows, row.results, row.list, row.evaluations, row.penilaian];
  for (const candidate of candidates) {
    const extracted = extractRows(candidate);
    if (extracted.length > 0) return extracted;
  }

  return [row];
}

function mapRowToEvaluation(
  row: Record<string, unknown>,
  criteria: AssessmentCriterion[]
): StudentEvaluation | null {
  const studentNode =
    (row.student && typeof row.student === "object" ? (row.student as Record<string, unknown>) : null) || row;

  const assessmentNode =
    (row.assessment && typeof row.assessment === "object" ? (row.assessment as Record<string, unknown>) : null) ||
    (row.penilaian && typeof row.penilaian === "object" ? (row.penilaian as Record<string, unknown>) : null) ||
    row;

  const studentId = normalizeText(
    studentNode.id || studentNode.studentId || studentNode.studentUserId || studentNode.userId,
    ""
  );
  if (!studentId) return null;

  const { components, totalScore } = buildFieldGrades(criteria, assessmentNode);
  const mentorTotal =
    parseNumber(assessmentNode.totalScore ?? assessmentNode.finalScore ?? assessmentNode.nilaiAkhir, totalScore);

  const academicTotal = parseNumber(
    row.academicScore ?? row.nilaiDosen ?? row.academicTotal ?? row.dosenTotal,
    0
  );

  const finalScore = academicTotal > 0 ? (mentorTotal + academicTotal) / 2 : mentorTotal;

  const fieldSupervisorGrades: FieldSupervisorGrade[] = [
    {
      category: "Penilaian Pembimbing Lapangan",
      components,
      totalScore: mentorTotal,
      maxScore: 100,
      percentage: mentorTotal,
    },
  ];

  const academicSupervisorGrades: AcademicSupervisorGrade[] =
    academicTotal > 0
      ? [
          {
            category: "Penilaian Dosen Pembimbing",
            components: [
              {
                name: "Nilai Dosen Pembimbing",
                score: academicTotal,
                maxScore: 100,
              },
            ],
            totalScore: academicTotal,
            maxScore: 100,
            percentage: academicTotal,
          },
        ]
      : [];

  return {
    student: {
      id: studentId,
      name: normalizeText(studentNode.name || studentNode.nama || row.studentName, "Mahasiswa"),
      studentId: normalizeText(studentNode.nim || studentNode.studentNim || row.nim || studentId, studentId),
      photo: typeof studentNode.photo === "string" ? studentNode.photo : undefined,
      company: normalizeText(
        row.companyName || row.company || (row.submission as Record<string, unknown> | undefined)?.companyName,
        "-"
      ),
      supervisor: normalizeText(
        row.mentorName || (row.mentor as Record<string, unknown> | undefined)?.name,
        "-"
      ),
      academicSupervisor: normalizeText(
        row.lecturerName || (row.lecturer as Record<string, unknown> | undefined)?.name,
        "-"
      ),
      internPeriod: {
        start: normalizeText(row.startDate || row.internshipStartDate, "-"),
        end: normalizeText(row.endDate || row.internshipEndDate, "-"),
      },
    },
    fieldSupervisorGrades,
    academicSupervisorGrades,
    summary: {
      fieldSupervisorTotal: mentorTotal,
      academicSupervisorTotal: academicTotal,
      finalScore,
      grade: gradeFromScore(finalScore),
      status: statusFromScore(finalScore),
    },
    notes: normalizeText(assessmentNode.feedback || assessmentNode.catatan, ""),
    evaluatedAt: normalizeText(
      assessmentNode.updatedAt || assessmentNode.updated_at || assessmentNode.createdAt,
      ""
    ),
  } satisfies StudentEvaluation;
}

export async function getAdminEvaluations(
  criteria: AssessmentCriterion[]
): Promise<ApiResponse<StudentEvaluation[]>> {
  let lastMessage = "Gagal memuat data penilaian admin.";

  for (const endpoint of ADMIN_LIST_ENDPOINTS) {
    const response = await apiClient<unknown>(endpoint, {
      method: "GET",
      _baseUrl: INTERNSHIP_API_BASE_URL,
    } as RequestInit & { _baseUrl: string });

    if (!response.success) {
      lastMessage = response.message || lastMessage;
      continue;
    }

    const rows = extractRows(response.data);
    const mapped = rows
      .map((row) => mapRowToEvaluation(row, criteria))
      .filter((row): row is StudentEvaluation => Boolean(row));

    return {
      success: true,
      message: response.message || "Data penilaian admin berhasil diambil.",
      data: mapped,
    };
  }

  return {
    success: false,
    message: lastMessage,
    data: [],
  };
}

export async function getAdminEvaluationByStudentId(
  studentId: string,
  criteria: AssessmentCriterion[]
): Promise<ApiResponse<StudentEvaluation | null>> {
  let lastMessage = "Gagal memuat detail penilaian mahasiswa.";

  for (const baseEndpoint of ADMIN_DETAIL_ENDPOINTS) {
    const response = await apiClient<unknown>(`${baseEndpoint}/${studentId}`, {
      method: "GET",
      _baseUrl: INTERNSHIP_API_BASE_URL,
    } as RequestInit & { _baseUrl: string });

    if (!response.success) {
      lastMessage = response.message || lastMessage;
      continue;
    }

    const objectRow = pickFirstObject(response.data);
    if (!objectRow) {
      return {
        success: true,
        message: response.message || "Data penilaian belum tersedia.",
        data: null,
      };
    }

    const mapped = mapRowToEvaluation(objectRow, criteria);
    return {
      success: true,
      message: response.message || "Detail penilaian berhasil diambil.",
      data: mapped,
    };
  }

  return {
    success: false,
    message: lastMessage,
    data: null,
  };
}
