import { Award, Building2, TrendingUp, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { StudentCardProps } from "../types";

export function StudentCard({ student, summary, onClick }: StudentCardProps) {
  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-500 text-white";
      case "B":
        return "bg-blue-500 text-white";
      case "C":
        return "bg-yellow-500 text-white";
      case "D":
        return "bg-orange-500 text-white";
      case "E":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onClick(student.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-14 w-14">
              <AvatarImage src={student.photo} alt={student.name} />
              <AvatarFallback>
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 transition-colors truncate">
                {student.name}
              </h3>
              <p className="text-sm text-gray-600">{student.studentId}</p>
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
            <div className="text-2xl font-bold text-green-700">
              {summary.finalScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Nilai Akhir</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Company */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{student.company}</span>
        </div>

        {/* Supervisors */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <User className="h-3 w-3" />
              <span>Pembimbing Lapangan</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {student.supervisor}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <Award className="h-3 w-3" />
              <span>Dosen Pembimbing</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {student.academicSupervisor}
            </p>
          </div>
        </div>

        {/* Grade Summary */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-700">
              {summary.fieldSupervisorTotal.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Nilai Pembimbing</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="text-lg font-bold text-purple-700">
              {summary.academicSupervisorTotal.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Nilai Dosen</div>
          </div>
        </div>

        {/* View Details */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-green-700 group-hover:text-green-800 font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Lihat Detail Penilaian</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
