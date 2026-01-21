import type { StudentGradingInfo } from "../types";

export const MOCK_STUDENTS_FOR_GRADING: StudentGradingInfo[] = [
  {
    student: {
      id: "std-001",
      name: "Ahmad Fauzi",
      studentId: "1234567890",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
      company: "PT. Teknologi Nusantara",
      fieldSupervisor: "Budi Santoso",
      internPeriod: {
        start: "2024-07-01",
        end: "2024-09-30",
      },
    },
    gradingStatus: "graded",
    academicGrades: [
      {
        category: "Penilaian Dosen Pembimbing",
        components: [
          {
            name: "Kesesuaian Laporan dengan Format",
            score: 85,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Penguasaan Materi KP",
            score: 88,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Analisis dan Perancangan",
            score: 82,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Sikap dan Etika",
            score: 86,
            maxScore: 100,
            weight: 10,
          },
        ],
        totalScore: 85.1,
        maxScore: 100,
        percentage: 85.1,
      },
    ],
    fieldSupervisorGrades: [
      {
        category: "Penilaian Pembimbing Lapangan",
        components: [
          {
            name: "Kehadiran",
            score: 85,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kerjasama",
            score: 88,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Sikap, Etika dan Tingkah Laku",
            score: 90,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Prestasi Kerja",
            score: 87,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kreatifitas",
            score: 82,
            maxScore: 100,
            weight: 10,
          },
        ],
        totalScore: 87.2,
        maxScore: 100,
        percentage: 87.2,
      },
    ],
    summary: {
      fieldSupervisorTotal: 87.2,
      academicSupervisorTotal: 85.1,
      finalScore: 86.15,
      grade: "A",
      status: "passed",
    },
    notes:
      "Mahasiswa menunjukkan kinerja yang sangat baik selama masa magang. Laporan disusun dengan baik dan presentasi cukup memuaskan.",
    gradedAt: "2024-10-15T10:30:00Z",
    revisionStatus: "sudah-direvisi",
  },
  {
    student: {
      id: "std-002",
      name: "Rizki Maulana",
      studentId: "1234567892",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizki",
      company: "PT. Inovasi Teknologi",
      fieldSupervisor: "Andi Wijaya",
      internPeriod: {
        start: "2024-07-01",
        end: "2024-09-30",
      },
    },
    gradingStatus: "graded",
    revisionStatus: "sudah-direvisi",
    academicGrades: [
      {
        category: "Penilaian Dosen Pembimbing",
        components: [
          {
            name: "Kesesuaian Laporan dengan Format",
            score: 90,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Penguasaan Materi KP",
            score: 92,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Analisis dan Perancangan",
            score: 88,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Sikap dan Etika",
            score: 91,
            maxScore: 100,
            weight: 10,
          },
        ],
        totalScore: 90.1,
        maxScore: 100,
        percentage: 90.1,
      },
    ],
    fieldSupervisorGrades: [
      {
        category: "Penilaian Pembimbing Lapangan",
        components: [
          {
            name: "Kehadiran",
            score: 95,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kerjasama",
            score: 93,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Sikap, Etika dan Tingkah Laku",
            score: 92,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Prestasi Kerja",
            score: 90,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kreatifitas",
            score: 88,
            maxScore: 100,
            weight: 10,
          },
        ],
        totalScore: 92.2,
        maxScore: 100,
        percentage: 92.2,
      },
    ],
    summary: {
      fieldSupervisorTotal: 92.2,
      academicSupervisorTotal: 90.1,
      finalScore: 91.15,
      grade: "A",
      status: "passed",
    },
    notes:
      "Mahasiswa sangat excellent dalam semua aspek. Laporan sangat sistematis dan presentasi sangat meyakinkan.",
    gradedAt: "2024-10-16T14:20:00Z",
  },
  {
    student: {
      id: "std-003",
      name: "Rizki Maulana",
      studentId: "1234567892",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizki",
      company: "PT. Inovasi Teknologi",
      fieldSupervisor: "Andi Wijaya",
      internPeriod: {
        start: "2024-07-15",
        end: "2024-10-15",
      },
    },
    gradingStatus: "not-graded",
    revisionStatus: "proses",
    fieldSupervisorGrades: [
      {
        category: "Penilaian Pembimbing Lapangan",
        components: [
          {
            name: "Kehadiran",
            score: 88,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kerjasama",
            score: 85,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Sikap, Etika dan Tingkah Laku",
            score: 87,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Prestasi Kerja",
            score: 82,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kreatifitas",
            score: 80,
            maxScore: 100,
            weight: 10,
          },
        ],
        totalScore: 85.2,
        maxScore: 100,
        percentage: 85.2,
      },
    ],
  },
  {
    student: {
      id: "std-004",
      name: "Siti Nurhaliza",
      studentId: "1234567893",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
      company: "PT. Digital Indonesia",
      fieldSupervisor: "Dewi Lestari",
      internPeriod: {
        start: "2024-08-01",
        end: "2024-11-01",
      },
    },
    gradingStatus: "not-graded",
    revisionStatus: "belum-direvisi",
    fieldSupervisorGrades: [
      {
        category: "Penilaian Pembimbing Lapangan",
        components: [
          {
            name: "Kehadiran",
            score: 92,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kerjasama",
            score: 90,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Sikap, Etika dan Tingkah Laku",
            score: 91,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Prestasi Kerja",
            score: 88,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Kreatifitas",
            score: 85,
            maxScore: 100,
            weight: 10,
          },
        ],
        totalScore: 89.7,
        maxScore: 100,
        percentage: 89.7,
      },
    ],
  },
];
