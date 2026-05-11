import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Configuration untuk setiap status di response letter timeline
 */
export interface StatusConfig {
  title: string;
  description: string;
  icon: ReactNode;
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
      iconBg: "bg-gray-500",
      bg: "bg-gray-50 dark:bg-gray-950/20",
      border: "border-gray-500",
      textColor: "text-gray-600 dark:text-gray-400",
    },
    APPROVED: {
      title: "Surat Balasan(berstatus: Disetujui) Terverifikasi",
      description:
        "Surat balasan Anda telah diverifikasi oleh admin. Sekarang, anda diizinkan untuk melaksanakan kerja praktik.",
      icon: <CheckCircle2 className="size-6" />,
      iconBg: "bg-green-600",
      bg: "bg-green-50 dark:bg-green-950/20",
      border: "border-green-600",
      textColor: "text-green-600 dark:text-green-400",
    },
    REJECTED: {
      title: "Surat Balasan(berstatus: Ditolak) Terverifikasi",
      description:
        "Surat balasan Anda telah diverifikasi oleh admin. Dikarenakan surat balasan Anda ditolak, silakan ajukan ulang dengan mencari instansi lain.",
      icon: <XCircle className="size-6" />,
      iconBg: "bg-red-600",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-600",
      textColor: "text-red-600 dark:text-red-400",
    },
  };

  return configs[status] || configs.PENDING;
}
