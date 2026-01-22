// Mock data for demonstration
import type { StudentGradeInfo } from "../types/index.d";

export const MOCK_STUDENT_GRADE: StudentGradeInfo = {
  studentId: "1",
  studentName: "Ahmad Fauzi",
  nim: "1234567890",
  company: "PT. Teknologi Maju Indonesia",
  hasFieldMentorGrade: true,
  hasAcademicSupervisorGrade: true,
  canViewCombinedGrade: true,
  fieldMentorGrade: {
    categories: [
      {
        category: "Kehadiran (20%)",
        components: [
          { name: "Kehadiran", score: 90, maxScore: 100 },
        ],
        totalScore: 90,
        maxScore: 100,
      },
      {
        category: "Kerjasama (30%)",
        components: [
          { name: "Kerjasama", score: 90, maxScore: 100 },
        ],
        totalScore: 90,
        maxScore: 100,
      },
      {
        category: "Sikap, Etika dan Tingkah Laku (20%)",
        components: [
          { name: "Sikap, Etika dan Tingkah Laku", score: 90, maxScore: 100 },
        ],
        totalScore: 90,
        maxScore: 100,
      },
      {
        category: "Prestasi Kerja (20%)",
        components: [
          { name: "Prestasi Kerja", score: 85, maxScore: 100 },
        ],
        totalScore: 85,
        maxScore: 100,
      },
      {
        category: "Kreativitas (10%)",
        components: [
          { name: "Kreativitas", score: 90, maxScore: 100 },
        ],
        totalScore: 90,
        maxScore: 100,
      },
    ],
    totalScore: 89,
    maxScore: 100,
    percentage: 30,
    weightedScore: 26.7, // (89/100) * 100 * 0.3
    notes: "Mahasiswa menunjukkan kinerja yang sangat baik selama magang.",
    gradedAt: "2026-01-15T10:30:00.000Z",
    gradedBy: "Ir. Budi Santoso",
  },
  academicSupervisorGrade: {
    categories: [
      {
        category: "Kesesuaian Laporan dengan Format (30%)",
        components: [
          { name: "Kesesuaian Laporan dengan Format", score: 90, maxScore: 100 },
        ],
        totalScore: 90,
        maxScore: 100,
      },
      {
        category: "Penguasaan Materi KP (30%)",
        components: [
          { name: "Penguasaan Materi KP", score: 87, maxScore: 100 },
        ],
        totalScore: 87,
        maxScore: 100,
      },
      {
        category: "Analisis dan Perancangan (30%)",
        components: [
          { name: "Analisis dan Perancangan", score: 83, maxScore: 100 },
        ],
        totalScore: 83,
        maxScore: 100,
      },
      {
        category: "Sikap dan Etika (10%)",
        components: [
          { name: "Sikap dan Etika", score: 90, maxScore: 100 },
        ],
        totalScore: 90,
        maxScore: 100,
      },
    ],
    totalScore: 87,
    maxScore: 100,
    percentage: 70,
    weightedScore: 60.9, // (87/100) * 100 * 0.7
    notes: "Laporan KP sudah baik, analisis mendalam dan sistematis.",
    gradedAt: "2026-01-20T14:00:00.000Z",
    gradedBy: "Dr. Siti Aminah, M.Kom",
  },
  combinedGrade: {
    fieldMentorScore: 26.7,
    academicSupervisorScore: 60.9,
    totalScore: 87.6, // 26.7 + 60.9
    averageScore: 43.8, // 87.6 / 2
    grade: "A",
    status: "lulus",
    remarks: "Selamat! Anda telah menyelesaikan program Kerja Praktik dengan nilai yang sangat baik.",
  },
};

// Mock data with incomplete grading
export const MOCK_STUDENT_GRADE_INCOMPLETE: StudentGradeInfo = {
  studentId: "2",
  studentName: "Siti Nurhaliza",
  nim: "0987654321",
  company: "CV. Digital Inovasi",
  hasFieldMentorGrade: true,
  hasAcademicSupervisorGrade: false,
  canViewCombinedGrade: false,
  fieldMentorGrade: {
    categories: [
      {
        category: "Kehadiran (20%)",
        components: [
          { name: "Kehadiran", score: 95, maxScore: 100 },
        ],
        totalScore: 95,
        maxScore: 100,
      },
      {
        category: "Kerjasama (30%)",
        components: [
          { name: "Kerjasama", score: 93, maxScore: 100 },
        ],
        totalScore: 93,
        maxScore: 100,
      },
      {
        category: "Sikap, Etika dan Tingkah Laku (20%)",
        components: [
          { name: "Sikap, Etika dan Tingkah Laku", score: 95, maxScore: 100 },
        ],
        totalScore: 95,
        maxScore: 100,
      },
      {
        category: "Prestasi Kerja (20%)",
        components: [
          { name: "Prestasi Kerja", score: 90, maxScore: 100 },
        ],
        totalScore: 90,
        maxScore: 100,
      },
      {
        category: "Kreativitas (10%)",
        components: [
          { name: "Kreativitas", score: 80, maxScore: 100 },
        ],
        totalScore: 80,
        maxScore: 100,
      },
    ],
    totalScore: 92,
    maxScore: 100,
    percentage: 30,
    weightedScore: 27.6,
    gradedAt: "2026-01-18T09:00:00.000Z",
    gradedBy: "Ahmad Yani, S.T.",
  },
};
