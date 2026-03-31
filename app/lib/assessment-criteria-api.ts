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
  category: string;
  weight: number; // Bobot dalam persen (total harus = 100)
  description: string;
  maxScore: number;
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

// ==================== HELPERS ====================

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Ambil daftar kriteria penilaian dari database.
 * Jika API gagal / belum ready, otomatis fallback ke DEFAULT_CRITERIA.
 */
export async function getAssessmentCriteria(): Promise<AssessmentCriterion[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/penilaian/kriteria`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();

    // Docs response: { success, data: { kriteria: [...], totalWeight, note } }
    const list = json?.data?.kriteria;
    if (json.success && Array.isArray(list) && list.length > 0) {
      return list.map((c: { id: string; label: string; description: string; weight: number; maxScore: number }) => ({
        id: c.id,
        category: c.label,   // API uses "label" for display name
        weight: c.weight,
        description: c.description,
        maxScore: c.maxScore,
      })) as AssessmentCriterion[];
    }

    console.warn("[AssessmentCriteria] API response invalid, using defaults");
    return DEFAULT_CRITERIA;
  } catch (error) {
    console.warn("[AssessmentCriteria] API tidak tersedia, menggunakan default:", error);
    return DEFAULT_CRITERIA;
  }
}

/**
 * Update bobot kriteria penilaian di database.
 * Hanya bisa dipanggil oleh admin (backend enforce via auth middleware).
 *
 * @param criteria - Array kriteria dengan bobot baru (total weight harus = 100)
 */
export async function updateAssessmentCriteria(
  criteria: AssessmentCriterion[]
): Promise<{ success: boolean; message: string }> {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight !== 100) {
    return {
      success: false,
      message: `Total bobot harus 100%, saat ini ${totalWeight}%`,
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/penilaian/kriteria`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        // Docs request body: { kriteria: [...] }
        body: JSON.stringify({
          kriteria: criteria.map((c) => ({
            category: c.id || c.category.toLowerCase().replace(/ /g, "_"),
            label: c.category,
            weight: c.weight,
            maxScore: c.maxScore,
          })),
        }),
      }
    );

    const data = await response.json();

    return {
      success: response.ok && data.success,
      message: data.message || (response.ok ? "Berhasil disimpan" : "Gagal menyimpan"),
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal terhubung ke server",
    };
  }
}
