// Student Evaluation Types

export interface Student {
  id: string;
  name: string;
  studentId: string;
  photo?: string;
  company: string;
  supervisor: string;
  academicSupervisor: string;
  internPeriod: {
    start: string;
    end: string;
  };
}

// Grade from Field Supervisor (Pembimbing Lapangan)
export interface FieldSupervisorGrade {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

// Grade from Academic Supervisor (Dosen Pembimbing)
export interface AcademicSupervisorGrade {
  category: string;
  components: GradeComponent[];
  totalScore: number;
  maxScore: number;
  percentage: number;
}

// Individual grade component
export interface GradeComponent {
  name: string;
  score: number;
  maxScore: number;
  weight?: number;
}

// Final evaluation summary
export interface EvaluationSummary {
  fieldSupervisorTotal: number;
  academicSupervisorTotal: number;
  finalScore: number;
  grade: string; // A, B, C, D, E
  status: "passed" | "failed" | "pending";
}

// Complete student evaluation
export interface StudentEvaluation {
  student: Student;
  fieldSupervisorGrades: FieldSupervisorGrade[];
  academicSupervisorGrades: AcademicSupervisorGrade[];
  summary: EvaluationSummary;
  notes?: string;
  evaluatedAt?: string;
}

// Props for components
export interface StudentCardProps {
  student: Student;
  summary: EvaluationSummary;
  onClick: (id: string) => void;
}

export interface StudentListProps {
  evaluations: StudentEvaluation[];
  onStudentClick: (id: string) => void;
  isLoading?: boolean;
}

export interface GradeSectionProps {
  title: string;
  grades: (FieldSupervisorGrade | AcademicSupervisorGrade)[];
  totalScore: number;
  maxScore: number;
}
