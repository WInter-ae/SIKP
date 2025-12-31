// Student information for grading
export interface StudentForGrading {
  id: string;
  name: string;
  studentId: string;
  photo: string;
  company: string;
  fieldSupervisor: string;
  internPeriod: {
    start: string;
    end: string;
  };
}

// Grade component for each criterion
export interface GradeComponent {
  name: string;
  score: number;
  maxScore: number;
  weight: number;
}

// Academic supervisor grading categories
export interface AcademicGradeCategory {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

// Field supervisor grades (read-only for dosen)
export interface FieldSupervisorGrade {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

// Form data for grading input
export interface GradingFormData {
  // Laporan KP
  reportSystematics: number; // Sistematika Penulisan (20%)
  reportContent: number; // Isi dan Pembahasan (40%)
  reportAnalysis: number; // Analisis dan Kesimpulan (40%)

  // Presentasi & Ujian
  presentationDelivery: number; // Penyampaian Materi (30%)
  presentationMastery: number; // Penguasaan Materi (50%)
  presentationQA: number; // Kemampuan Menjawab (20%)

  notes?: string; // Catatan penilaian
}

// Grading status
export type GradingStatus = "graded" | "not-graded" | "pending";

// Student with grading status
export interface StudentGradingInfo {
  student: StudentForGrading;
  gradingStatus: GradingStatus;
  academicGrades?: AcademicGradeCategory[];
  fieldSupervisorGrades?: FieldSupervisorGrade[];
  summary?: {
    academicSupervisorTotal: number;
    fieldSupervisorTotal: number;
    finalScore: number;
    grade: "A" | "B" | "C" | "D" | "E";
    status: "passed" | "failed" | "pending";
  };
  notes?: string;
  gradedAt?: string;
}

// Complete student grading detail
export interface StudentGradingDetail {
  student: StudentForGrading;
  academicGrades: AcademicGradeCategory[];
  fieldSupervisorGrades: FieldSupervisorGrade[];
  summary: {
    academicSupervisorTotal: number;
    fieldSupervisorTotal: number;
    finalScore: number;
    grade: "A" | "B" | "C" | "D" | "E";
    status: "passed" | "failed" | "pending";
  };
  notes?: string;
  gradedAt: string;
}
