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
  // Penilaian Dosen Pembimbing
  reportFormat: number; // Kesesuaian Laporan dengan Format (30%)
  materialMastery: number; // Penguasaan Materi KP (30%)
  analysisDesign: number; // Analisis dan Perancangan (30%)
  attitudeEthics: number; // Sikap dan Etika (10%)

  notes?: string; // Catatan penilaian
}

// Grading status
export type GradingStatus = "graded" | "not-graded" | "pending";

// Revision status
export type RevisionStatus = "sudah-direvisi" | "proses" | "belum-direvisi";

// Student with grading status
export interface StudentGradingInfo {
  student: StudentForGrading;
  gradingStatus: GradingStatus;
  revisionStatus?: RevisionStatus;
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
