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

// Nilai KP untuk Mahasiswa
export interface NilaiKP {
  id: string;
  mahasiswaId: string;
  dosenPembimbingId: string;
  
  // Komponen Nilai
  nilaiPembimbingLapangan?: number; // Dari mentor
  nilaiLaporanKP?: number;
  nilaiPresentasi?: number;
  nilaiSidang?: number;
  
  // Nilai Akhir
  nilaiAkhir?: number;
  nilaiHuruf?: string; // A, B+, B, C+, C, D, E
  
  // Status dan Catatan
  status: "belum_dinilai" | "sedang_dinilai" | "perlu_revisi" | "selesai";
  catatanRevisi?: string;
  catatanUmum?: string;
  
  // Metadata
  tanggalPenilaian?: string;
  tanggalRevisiDiminta?: string;
  tanggalRevisiSelesai?: string;
  
  // Info Dosen
  dosenPenguji?: {
    nama: string;
    nip: string;
  }[];
}

export interface RevisiKP {
  id: string;
  nilaiKPId: string;
  mahasiswaId: string;
  
  // Revisi Request
  jenisRevisi: "laporan" | "kode" | "dokumentasi" | "presentasi" | "lainnya";
  deskripsiRevisi: string;
  prioritas: "rendah" | "sedang" | "tinggi";
  
  // File Upload
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  
  // Status
  status: "menunggu_upload" | "menunggu_review" | "disetujui" | "ditolak";
  catatanMahasiswa?: string;
  catatanDosen?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface HistoryRevisi {
  id: string;
  revisiId: string;
  action: "dibuat" | "diupload" | "direview" | "disetujui" | "ditolak" | "direvisi";
  deskripsi: string;
  actor: {
    id: string;
    nama: string;
    role: "mahasiswa" | "dosen" | "sistem";
  };
  timestamp: string;
  details?: Record<string, any>;
}
