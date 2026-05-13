/**
 * Assessment Criteria API Service
 *
 * Shared service untuk mengambil & update bobot kriteria penilaian.
 * Digunakan oleh: mentor assessment, during-intern assessment view, admin management.
 *
 * Endpoints:
 *   GET  /api/penilaian/kriteria         → ambil daftar kriteria + bobot
 *   PUT  /api/admin/penilaian/kriteria   → update bobot (admin only)
 */

import { INTERNSHIP_API_BASE_URL } from "~/lib/api-client";

const API_BASE_URL = INTERNSHIP_API_BASE_URL;

// ==================== TYPES ====================

export interface AssessmentCriterion {
  id: string;
  categoryId?: string;
  category: string;
  categoryKey?: string;
  label?: string;
  weight: number; // Bobot dalam persen (total harus = 100)
  description: string;
  maxScore: number;
  sortOrder?: number;
  isActive?: boolean;
}

// ==================== FALLBACK (jika API belum ready) ====================

export const DEFAULT_CRITERIA: AssessmentCriterion[] = [
  {
    id: "1",
    category: "Kehadiran",
    weight: 20,
    description: "Tingkat kehadiran dan ketepatan waktu",
    maxScore: 100,
  },
  {
    id: "2",
    category: "Kerjasama",
    weight: 30,
    description: "Kemampuan bekerja dalam tim",
    maxScore: 100,
  },
  {
    id: "3",
    category: "Sikap, Etika dan Tingkah Laku",
    weight: 20,
    description: "Sikap profesional, etika kerja, dan perilaku di tempat kerja",
    maxScore: 100,
  },
  {
    id: "4",
    category: "Prestasi Kerja",
    weight: 20,
    description: "Kualitas dan hasil kerja yang dicapai",
    maxScore: 100,
  },
  {
    id: "5",
    category: "Kreatifitas",
    weight: 10,
    description: "Kemampuan berpikir kreatif dan inovatif",
    maxScore: 100,
  },
];

export const DEFAULT_DOSEN_PA_CRITERIA: AssessmentCriterion[] = [
  {
    id: "pa-1",
    category: "Kesesuaian Laporan dengan Format",
    weight: 30,
    description: "Kesesuaian laporan dengan pedoman format yang berlaku",
    maxScore: 100,
  },
  {
    id: "pa-2",
    category: "Penguasaan Materi KP",
    weight: 30,
    description: "Kedalaman pemahaman mahasiswa terhadap topik magang",
    maxScore: 100,
  },
  {
    id: "pa-3",
    category: "Analisis dan Perancangan",
    weight: 30,
    description: "Kualitas analisis masalah dan solusi perancangan sistem",
    maxScore: 100,
  },
  {
    id: "pa-4",
    category: "Sikap dan Etika",
    weight: 10,
    description: "Etika dalam penulisan dan kejujuran akademik",
    maxScore: 100,
  },
];

// ==================== HELPERS ====================

export function extractKriteria(raw: any): AssessmentCriterion[] {
  if (Array.isArray(raw?.data) && raw.data[0]?.kriteria)
    return raw.data[0].kriteria as AssessmentCriterion[];
  if (raw?.data?.kriteria) return raw.data.kriteria as AssessmentCriterion[];
  if (Array.isArray(raw?.kriteria))
    return raw.kriteria as AssessmentCriterion[];
  return [];
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

import { internshipClient } from "~/lib/api-client";

// ==================== API FUNCTIONS ====================

/**
 * Ambil daftar kriteria penilaian dari database.
 * Jika API gagal / belum ready, otomatis fallback ke DEFAULT_CRITERIA.
 */
export async function getAssessmentCriteria(
  type: "MENTOR" | "DOSEN_PA" = "MENTOR",
): Promise<AssessmentCriterion[]> {
  try {
    const response = await internshipClient.get<any>("/api/penilaian/kriteria", { type });

    if (!response.success || !response.data) {
      throw new Error(response.message || "Gagal mengambil kriteria");
    }

    const list = extractKriteria(response);
    if (Array.isArray(list) && list.length > 0) {
      return list.map(
        (c: any) => ({
          id: String(c.id),
          categoryId: c.categoryId || String(c.id),
          category: c.label || c.category || c.categoryKey || "Kategori",
          categoryKey: c.categoryKey || c.category,
          label: c.label,
          weight: Number(c.weight || 0),
          description: c.description || "-",
          maxScore: Number(c.maxScore || 100),
          sortOrder: c.sortOrder,
          isActive: typeof c.isActive === "boolean" ? c.isActive : true,
        }),
      ) as AssessmentCriterion[];
    }

    return type === "DOSEN_PA" ? DEFAULT_DOSEN_PA_CRITERIA : DEFAULT_CRITERIA;
  } catch (error) {
    console.warn(
      "[AssessmentCriteria] Menggunakan default kriteria karena:",
      error,
    );
    return type === "DOSEN_PA" ? DEFAULT_DOSEN_PA_CRITERIA : DEFAULT_CRITERIA;
  }
}

/**
 * Update bobot kriteria penilaian di database.
 * Hanya bisa dipanggil oleh admin (backend enforce via auth middleware).
 *
 * @param criteria - Array kriteria dengan bobot baru (total weight harus = 100)
 * @param type - Tipe kriteria yang diupdate
 */
export async function updateAssessmentCriteria(
  criteria: AssessmentCriterion[],
  type: "MENTOR" | "DOSEN_PA" = "MENTOR",
): Promise<{ success: boolean; message: string }> {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight !== 100) {
    return {
      success: false,
      message: `Total bobot harus 100%, saat ini ${totalWeight}%`,
    };
  }

  try {
    const response = await internshipClient.put<any>(`/api/admin/penilaian/kriteria?type=${type}`, {
      kriteria: criteria.map((c, index) => ({
        id: c.id,
        categoryId: c.categoryId || c.id,
        category:
          c.categoryKey || c.category.toLowerCase().replace(/ /g, "_"),
        label: c.category,
        description: c.description,
        weight: c.weight,
        maxScore: c.maxScore,
        sortOrder: c.sortOrder ?? index + 1,
        isActive: c.isActive ?? true,
      })),
    });

    return {
      success: response.success,
      message: response.message || (response.success ? "Berhasil disimpan" : "Gagal menyimpan"),
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal terhubung ke server",
    };
  }
}
