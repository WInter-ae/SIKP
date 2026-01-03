import { InternReportCard } from "./report-card";
import { Skeleton } from "~/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import type { Report } from "../types";

interface InternReportListProps {
  reports: Report[];
  isLoading?: boolean;
  onReportClick: (id: string) => void;
}

function InternReportList({
  reports,
  isLoading = false,
  onReportClick,
}: InternReportListProps) {
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

  if (reports.length === 0) {
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
      {reports.map((item) => (
        <InternReportCard key={item.id} report={item} onClick={onReportClick} />
      ))}
    </div>
  );
}

export { InternReportList };
