export interface ProcessStepProps {
  title: string;
  description: string;
  icon?: string;
  status: "submitted" | "rejected" | "resubmitted" | "approved";
  comment?: string;
  onAction?: () => void;
  actionText?: string;
  showDocumentPreview?: boolean;
  approvedDate?: string;
}
