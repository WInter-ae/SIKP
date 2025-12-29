export interface FileUploadProps {
  label: string;
  onFileChange?: (file: File) => void;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  status: "submitted" | "rejected" | "approved";
  visible: boolean;
}

export interface ProcessStepsProps {
  steps: ProcessStep[];
}

export interface StudentMember {
  id: number;
  name: string;
  nim?: string;
  prodi?: string;
  role: "Ketua" | "Anggota";
}

export interface Student {
  id: number;
  name: string;
  role: string;
  tanggal: string;
  nim: string;
  company: string;
  memberCount: number; // Total anggota dalam tim (1 bila individu)
  status: "Disetujui" | "Ditolak"; // Status dari perusahaan
  adminApproved: boolean; // Apakah admin sudah meng-approve
  supervisor?: string;
  members?: StudentMember[];
  responseFileUrl?: string;
}