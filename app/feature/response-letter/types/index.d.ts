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

export interface Student {
  id: number;
  name: string;
  role: string;
  tanggal: string;
  status: "Disetujui" | "Ditolak";
}