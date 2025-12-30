import { LaporanCard } from "./laporan-card";
import { Skeleton } from "~/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import type { LaporanListProps } from "../types";

export function LaporanList({
  laporan,
  isLoading = false,
  onLaporanClick,
}: LaporanListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (laporan.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Tidak ada laporan KP yang ditemukan. Coba ubah filter atau kata kunci
          pencarian.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {laporan.map((item) => (
        <LaporanCard key={item.id} laporan={item} onClick={onLaporanClick} />
      ))}
    </div>
  );
}
