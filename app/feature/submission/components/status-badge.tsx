import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface StatusBadgeProps {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component untuk display document status dengan warna yang berbeda
 * - APPROVED: Hijau (Disetujui)
 * - REJECTED: Merah (Ditolak)
 * - PENDING: Abu-abu (Menunggu Review)
 */
export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  if (!status) return null;

  const baseClass = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const iconClass = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  switch (status) {
    case 'APPROVED':
      return (
        <Badge className={`${baseClass[size]} bg-green-500 text-white hover:bg-green-600 flex items-center w-fit`}>
          <CheckCircle className={iconClass[size]} />
          <span>Disetujui</span>
        </Badge>
      );

    case 'REJECTED':
      return (
        <Badge className={`${baseClass[size]} bg-red-500 text-white hover:bg-red-600 flex items-center w-fit`}>
          <AlertCircle className={iconClass[size]} />
          <span>Ditolak</span>
        </Badge>
      );

    case 'PENDING':
      return (
        <Badge variant="outline" className={`${baseClass[size]} flex items-center w-fit`}>
          <Clock className={iconClass[size]} />
          <span>Menunggu Review</span>
        </Badge>
      );

    default:
      return null;
  }
}

export default StatusBadge;
