import { Clock, CheckCircle2, XCircle } from "lucide-react";

/**
 * Configuration untuk setiap status di response letter timeline
 */
export interface StatusConfig {
  title: string;
  description: string;
  icon: JSX.Element;
  iconBg: string;
  bg: string;
  border: string;
  textColor: string;
}

/**
 * Mapping status ke UI configuration
 * @param status Response letter status
 * @returns StatusConfig object
 */
export function getResponseLetterStatusConfig(
  status: "PENDING" | "APPROVED" | "REJECTED",
): StatusConfig {
  const configs: Record<string, StatusConfig> = {
    PENDING: {
      title: "Menunggu Verifikasi Admin",
      description:
        "Surat balasan Anda sedang dalam proses review oleh admin. Mohon tunggu konfirmasi lebih lanjut.",
      icon: <Clock className="size-6" />,
      iconBg: "bg-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-yellow-500",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    APPROVED: {
      title: "Surat Balasan Disetujui",
      description:
        "Selamat! Surat balasan Anda telah diverifikasi dan disetujui oleh admin. Kerja praktik Anda telah disetujui.",
      icon: <CheckCircle2 className="size-6" />,
      iconBg: "bg-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      border: "border-emerald-600",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    REJECTED: {
      title: "Surat Balasan Ditolak",
      description:
        "Surat balasan Anda ditolak oleh admin. Silakan periksa komentar di bawah dan ajukan ulang dengan perbaikan yang diperlukan.",
      icon: <XCircle className="size-6" />,
      iconBg: "bg-red-600",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-600",
      textColor: "text-red-600 dark:text-red-400",
    },
  };

  return configs[status] || configs.PENDING;
}
