import type { StudentEvaluation } from "../types";

export const MOCK_EVALUATIONS: StudentEvaluation[] = [
  {
    student: {
      id: "1",
      name: "Ahmad Rizki Pratama",
      studentId: "20011001",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
      company: "PT. Teknologi Maju",
      supervisor: "Budi Santoso",
      academicSupervisor: "Dr. Ir. Andi Wijaya, M.T.",
      internPeriod: {
        start: "2024-07-01",
        end: "2024-09-30",
      },
    },
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
    academicSupervisorGrades: [
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
    summary: {
      fieldSupervisorTotal: 87.2,
      academicSupervisorTotal: 85.1,
      finalScore: 86.15,
      grade: "A",
      status: "passed",
    },
    notes:
      "Mahasiswa menunjukkan kinerja yang sangat baik selama masa magang. Kehadiran konsisten dan kerjasama tim yang baik.",
    evaluatedAt: "2024-10-15",
  },
  {
    student: {
      id: "2",
      name: "Siti Nurhaliza",
      studentId: "20011002",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
      company: "CV. Digital Kreatif",
      supervisor: "Dewi Kartika",
      academicSupervisor: "Prof. Dr. Gunawan Santoso, M.Kom",
      internPeriod: {
        start: "2024-07-01",
        end: "2024-09-30",
      },
    },
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
    academicSupervisorGrades: [
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
    summary: {
      fieldSupervisorTotal: 92.2,
      academicSupervisorTotal: 90.1,
      finalScore: 91.15,
      grade: "A",
      status: "passed",
    },
    notes:
      "Mahasiswa sangat excellent dalam semua aspek. Kehadiran sempurna dan laporan tersusun dengan sangat rapi.",
    evaluatedAt: "2024-10-16",
  },
];
