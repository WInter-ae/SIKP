// Types for student grading view

export interface GradeComponent {
  name: string;
  score: number;
  maxScore: number;
}

export interface GradeCategory {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
}

// Nilai dari Mentor Lapangan (30%)
export interface FieldMentorGrade {
  categories: GradeCategory[];
  totalScore: number;
  maxScore: number;
  percentage: number; // 30
  weightedScore: number; // totalScore * 0.3
  notes?: string;
  gradedAt?: string;
  gradedBy?: string;
}

// Nilai dari Dosen Pembimbing KP (70%)
export interface AcademicSupervisorGrade {
  categories: GradeCategory[];
  totalScore: number;
  maxScore: number;
  percentage: number; // 70
  weightedScore: number; // totalScore * 0.7
  notes?: string;
  gradedAt?: string;
  gradedBy?: string;
}

// Rekap Nilai Gabungan
export interface CombinedGrade {
  fieldMentorScore: number;
  academicSupervisorScore: number;
  totalScore: number;
  averageScore: number;
  grade: "A" | "B" | "C" | "D" | "E";
  status: "lulus" | "tidak-lulus";
  remarks?: string;
}

// Complete student grading information
export interface StudentGradeInfo {
  studentId: string;
  studentName: string;
  nim: string;
  company: string;
  fieldMentorGrade?: FieldMentorGrade;
  academicSupervisorGrade?: AcademicSupervisorGrade;
  combinedGrade?: CombinedGrade;
  hasFieldMentorGrade: boolean;
  hasAcademicSupervisorGrade: boolean;
  canViewCombinedGrade: boolean;
}
