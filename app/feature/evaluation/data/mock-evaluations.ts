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
          { name: "Komunikasi", score: 85, maxScore: 100, weight: 25 },
          { name: "Kerjasama Tim", score: 90, maxScore: 100, weight: 25 },
          { name: "Inisiatif", score: 82, maxScore: 100, weight: 25 },
          { name: "Disiplin", score: 88, maxScore: 100, weight: 25 },
        ],
        totalScore: 86.25,
        maxScore: 100,
        percentage: 86.25,
      },
    ],
    academicSupervisorGrades: [
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
        category: "Presentasi dan Sidang",
        components: [
          { name: "Penyampaian Materi", score: 80, maxScore: 100, weight: 40 },
          { name: "Penguasaan Materi", score: 85, maxScore: 100, weight: 40 },
          { name: "Kemampuan Menjawab", score: 82, maxScore: 100, weight: 20 },
        ],
        totalScore: 82.6,
        maxScore: 100,
        percentage: 82.6,
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
      "Mahasiswa menunjukkan kinerja yang sangat baik selama masa magang. Memiliki kemampuan teknis yang kuat dan soft skills yang baik.",
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
          { name: "Komunikasi", score: 95, maxScore: 100, weight: 25 },
          { name: "Kerjasama Tim", score: 93, maxScore: 100, weight: 25 },
          { name: "Inisiatif", score: 90, maxScore: 100, weight: 25 },
          { name: "Disiplin", score: 95, maxScore: 100, weight: 25 },
        ],
        totalScore: 93.25,
        maxScore: 100,
        percentage: 93.25,
      },
    ],
    academicSupervisorGrades: [
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
        category: "Presentasi dan Sidang",
        components: [
          { name: "Penyampaian Materi", score: 88, maxScore: 100, weight: 40 },
          { name: "Penguasaan Materi", score: 90, maxScore: 100, weight: 40 },
          { name: "Kemampuan Menjawab", score: 85, maxScore: 100, weight: 20 },
        ],
        totalScore: 88.2,
        maxScore: 100,
        percentage: 88.2,
      },
    ],
    summary: {
      fieldSupervisorTotal: 92.875,
      academicSupervisorTotal: 89.1,
      finalScore: 90.99,
      grade: "A",
      status: "passed",
    },
    notes:
      "Mahasiswa sangat berprestasi dengan kinerja outstanding. Menunjukkan dedikasi tinggi dan hasil kerja yang excellent.",
    evaluatedAt: "2024-10-16",
  },
];
