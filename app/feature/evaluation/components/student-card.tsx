import { Award, Building2, TrendingUp, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { StudentCardProps } from "../types";

export function StudentCard({ student, summary, onClick }: StudentCardProps) {
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500 text-white dark:bg-green-600";
      case "B":
        return "bg-blue-500 text-white dark:bg-blue-600";
      case "C":
        return "bg-yellow-500 text-white dark:bg-yellow-600";
      case "D":
        return "bg-orange-500 text-white dark:bg-orange-600";
      case "E":
        return "bg-red-500 text-white dark:bg-red-600";
      default:
        return "bg-gray-500 text-white dark:bg-gray-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "passed":
        return "Lulus";
      case "failed":
        return "Tidak Lulus";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group dark:bg-gray-800 dark:border-gray-700"
      onClick={() => onClick(student.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-14 w-14">
              <AvatarImage src={student.photo} alt={student.name} />
              <AvatarFallback className="dark:bg-gray-700 dark:text-gray-200">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors truncate">
                {student.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{student.studentId}</p>
              <div className="flex gap-2 mt-2">
                <Badge
                  className={`${getGradeBadgeColor(summary.grade)} font-bold`}
                >
                  {summary.grade}
                </Badge>
                <Badge className={getStatusBadgeColor(summary.status)}>
                  {getStatusText(summary.status)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {summary.finalScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Nilai Akhir</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Company */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{student.company}</span>
        </div>

        {/* Supervisors */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t dark:border-gray-700">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <User className="h-3 w-3" />
              <span>Pembimbing Lapangan</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {student.supervisor}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Award className="h-3 w-3" />
              <span>Dosen Pembimbing</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {student.academicSupervisor}
            </p>
          </div>
        </div>

        {/* Grade Summary */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t dark:border-gray-700">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {summary.fieldSupervisorTotal.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Nilai Pembimbing</div>
          </div>
          <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
            <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
              {summary.academicSupervisorTotal.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Nilai Dosen</div>
          </div>
        </div>

        {/* View Details */}
        <div className="pt-2 border-t dark:border-gray-700">
          <div className="flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400 group-hover:text-green-800 dark:group-hover:text-green-300 font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Lihat Detail Penilaian</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
