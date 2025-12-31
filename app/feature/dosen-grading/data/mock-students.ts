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
        category: "Laporan Kerja Praktik",
        components: [
          {
            name: "Sistematika Penulisan",
            score: 85,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Isi dan Pembahasan",
            score: 88,
            maxScore: 100,
            weight: 40,
          },
          {
            name: "Analisis dan Kesimpulan",
            score: 82,
            maxScore: 100,
            weight: 40,
          },
        ],
        totalScore: 85,
        maxScore: 100,
        percentage: 85,
      },
      {
        category: "Presentasi & Ujian",
        components: [
          {
            name: "Penyampaian Materi",
            score: 80,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Penguasaan Materi",
            score: 85,
            maxScore: 100,
            weight: 50,
          },
          {
            name: "Kemampuan Menjawab",
            score: 82,
            maxScore: 100,
            weight: 20,
          },
        ],
        totalScore: 82.6,
        maxScore: 100,
        percentage: 82.6,
      },
    ],
    fieldSupervisorGrades: [
      {
        category: "Keterampilan Teknis",
        components: [
          {
            name: "Pemahaman Teknologi",
            score: 85,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Kemampuan Problem Solving",
            score: 88,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Kualitas Hasil Kerja",
            score: 90,
            maxScore: 100,
            weight: 40,
          },
        ],
        totalScore: 87.9,
        maxScore: 100,
        percentage: 87.9,
      },
      {
        category: "Soft Skills",
        components: [
          {
            name: "Komunikasi",
            score: 85,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Kerjasama Tim",
            score: 90,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Inisiatif",
            score: 82,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Disiplin",
            score: 88,
            maxScore: 100,
            weight: 25,
          },
        ],
        totalScore: 86.25,
        maxScore: 100,
        percentage: 86.25,
      },
    ],
    summary: {
      fieldSupervisorTotal: 87.075,
      academicSupervisorTotal: 83.8,
      finalScore: 85.44,
      grade: "A",
      status: "passed",
    },
    notes:
      "Mahasiswa menunjukkan kinerja yang sangat baik selama masa magang. Laporan disusun dengan baik dan presentasi cukup memuaskan.",
    gradedAt: "2024-10-15T10:30:00Z",
  },
  {
    student: {
      id: "std-002",
      name: "Siti Nurhaliza",
      studentId: "1234567891",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
      company: "PT. Digital Indonesia",
      fieldSupervisor: "Dewi Kartika",
      internPeriod: {
        start: "2024-07-01",
        end: "2024-09-30",
      },
    },
    gradingStatus: "graded",
    academicGrades: [
      {
        category: "Laporan Kerja Praktik",
        components: [
          {
            name: "Sistematika Penulisan",
            score: 90,
            maxScore: 100,
            weight: 20,
          },
          {
            name: "Isi dan Pembahasan",
            score: 92,
            maxScore: 100,
            weight: 40,
          },
          {
            name: "Analisis dan Kesimpulan",
            score: 88,
            maxScore: 100,
            weight: 40,
          },
        ],
        totalScore: 90,
        maxScore: 100,
        percentage: 90,
      },
      {
        category: "Presentasi & Ujian",
        components: [
          {
            name: "Penyampaian Materi",
            score: 88,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Penguasaan Materi",
            score: 92,
            maxScore: 100,
            weight: 50,
          },
          {
            name: "Kemampuan Menjawab",
            score: 85,
            maxScore: 100,
            weight: 20,
          },
        ],
        totalScore: 89.4,
        maxScore: 100,
        percentage: 89.4,
      },
    ],
    fieldSupervisorGrades: [
      {
        category: "Keterampilan Teknis",
        components: [
          {
            name: "Pemahaman Teknologi",
            score: 90,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Kemampuan Problem Solving",
            score: 92,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Kualitas Hasil Kerja",
            score: 95,
            maxScore: 100,
            weight: 40,
          },
        ],
        totalScore: 92.5,
        maxScore: 100,
        percentage: 92.5,
      },
      {
        category: "Soft Skills",
        components: [
          {
            name: "Komunikasi",
            score: 95,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Kerjasama Tim",
            score: 93,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Inisiatif",
            score: 90,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Disiplin",
            score: 95,
            maxScore: 100,
            weight: 25,
          },
        ],
        totalScore: 93.25,
        maxScore: 100,
        percentage: 93.25,
      },
    ],
    summary: {
      fieldSupervisorTotal: 92.875,
      academicSupervisorTotal: 89.7,
      finalScore: 91.29,
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
    fieldSupervisorGrades: [
      {
        category: "Keterampilan Teknis",
        components: [
          {
            name: "Pemahaman Teknologi",
            score: 88,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Kemampuan Problem Solving",
            score: 85,
            maxScore: 100,
            weight: 30,
          },
          {
            name: "Kualitas Hasil Kerja",
            score: 87,
            maxScore: 100,
            weight: 40,
          },
        ],
        totalScore: 86.6,
        maxScore: 100,
        percentage: 86.6,
      },
      {
        category: "Soft Skills",
        components: [
          {
            name: "Komunikasi",
            score: 82,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Kerjasama Tim",
            score: 85,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Inisiatif",
            score: 80,
            maxScore: 100,
            weight: 25,
          },
          {
            name: "Disiplin",
            score: 88,
            maxScore: 100,
            weight: 25,
          },
        ],
        totalScore: 83.75,
        maxScore: 100,
        percentage: 83.75,
      },
    ],
  },
];
