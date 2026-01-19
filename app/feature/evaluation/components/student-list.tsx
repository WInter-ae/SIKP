import { StudentCard } from "./student-card";
import { Skeleton } from "~/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import type { StudentListProps } from "../types";

export function StudentList({
  evaluations,
  onStudentClick,
  isLoading = false,
}: StudentListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Belum ada data penilaian mahasiswa yang tersedia.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {evaluations.map((evaluation) => (
        <StudentCard
          key={evaluation.student.id}
          student={evaluation.student}
          summary={evaluation.summary}
          onClick={onStudentClick}
        />
      ))}
    </div>
  );
}
