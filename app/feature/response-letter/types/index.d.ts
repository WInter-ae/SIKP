export interface FileUploadProps {
  label: string;
  onFileChange?: (file: File) => void;
}

export interface ProcessStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  status: "submitted" | "rejected" | "approved";
  visible: boolean;
}

export interface ProcessStepsProps {
  steps: ProcessStep[];
}