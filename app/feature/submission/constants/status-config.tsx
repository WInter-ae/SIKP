import { FileText, XCircle, Check } from "lucide-react";
import type { ReactElement } from "react";

/**
 * Status configuration for submission timeline
 */
export interface StatusConfig {
  title: string;
  description: string;
  icon: ReactElement;
  bg: string;
  border: string;
  iconBg: string;
  textColor: string;
}

/**
 * Status configurations mapping
 */
export const STATUS_CONFIGS: Record<string, StatusConfig> = {
  PENDING_REVIEW: {
    title: "Mengajukan Surat Pengantar",
    description: "Pengajuan surat pengantar telah diterima dan sedang dalam proses review",
    icon: <FileText className="h-6 w-6" />,
    bg: "bg-muted",
    border: "border-l-muted-foreground",
    iconBg: "bg-muted-foreground",
    textColor: "text-muted-foreground",
  },
  DRAFT: {
    title: "Mengajukan Surat Pengantar",
    description: "Pengajuan surat pengantar telah diterima dan sedang dalam proses review",
    icon: <FileText className="h-6 w-6" />,
    bg: "bg-muted",
    border: "border-l-muted-foreground",
    iconBg: "bg-muted-foreground",
    textColor: "text-muted-foreground",
  },
  REJECTED: {
    title: "Pengajuan Ditolak",
    description: "Pengajuan Anda ditolak. Silakan perbaiki dan ajukan kembali.",
    icon: <XCircle className="h-7 w-7" />,
    bg: "bg-destructive/10",
    border: "border-l-destructive",
    iconBg: "bg-destructive",
    textColor: "text-destructive",
  },
  APPROVED: {
    title: "Surat Pengantar Telah Dibuat",
    description: "Surat pengantar kerja praktik Anda telah disetujui dan dapat diunduh",
    icon: <Check className="h-7 w-7" />,
    bg: "bg-green-600/10",
    border: "border-l-green-600",
    iconBg: "bg-green-600",
    textColor: "text-green-600",
  },
};

/**
 * Default status configuration for unknown statuses
 */
export const DEFAULT_STATUS_CONFIG: StatusConfig = {
  title: "Status",
  description: "",
  icon: <FileText className="h-6 w-6" />,
  bg: "bg-muted",
  border: "border-l-border",
  iconBg: "bg-muted-foreground",
  textColor: "text-muted-foreground",
};

/**
 * Get status configuration by status key
 * @param status - Status key
 * @returns Status configuration
 */
export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIGS[status] || DEFAULT_STATUS_CONFIG;
}
