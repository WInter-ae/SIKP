import {
  Building2,
  Calendar,
  User,
  Award,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import type { StudentGradingInfo } from "../types";

interface StudentGradingCardProps {
  studentInfo: StudentGradingInfo;
  onGiveGrade?: (studentId: string) => void;
  onViewDetail?: (studentId: string) => void;
}

export function StudentGradingCard({
  studentInfo,
  onGiveGrade,
  onViewDetail,
}: StudentGradingCardProps) {
  const { student, gradingStatus, summary } = studentInfo;

  const getStatusBadge = () => {
    switch (gradingStatus) {
      case "graded":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sudah Dinilai
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "not-graded":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" />
            Belum Dinilai
          </Badge>
        );
    }
  };

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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={student.photo} alt={student.name} />
            <AvatarFallback>
              {student.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-semibold text-lg">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.studentId}</p>
              </div>
              {getStatusBadge()}
            </div>
            {gradingStatus === "graded" && summary && (
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={`${getGradeBadgeColor(summary.grade)} font-bold`}
                >
                  Grade {summary.grade}
                </Badge>
                <span className="text-sm font-semibold text-gray-700">
                  Nilai Akhir: {summary.finalScore.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Info */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Building2 className="h-4 w-4" />
            <span>Perusahaan</span>
          </div>
          <p className="font-medium text-gray-900">{student.company}</p>
        </div>

        {/* Intern Period */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar className="h-4 w-4" />
            <span>Periode Magang</span>
          </div>
          <p className="text-sm text-gray-900">
            {new Date(student.internPeriod.start).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            -{" "}
            {new Date(student.internPeriod.end).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Field Supervisor */}
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <User className="h-4 w-4" />
            <span>Pembimbing Lapangan</span>
          </div>
          <p className="font-medium text-gray-900">{student.fieldSupervisor}</p>
        </div>

        {/* Grade Summary for Graded Students */}
        {gradingStatus === "graded" && summary && (
          <div className="pt-3 border-t">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-1 text-blue-600 mb-1">
                  <Award className="h-3 w-3" />
                  <span className="text-xs">Nilai Dosen</span>
                </div>
                <div className="font-bold text-blue-700">
                  {summary.academicSupervisorTotal.toFixed(2)}
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-1 text-purple-600 mb-1">
                  <Award className="h-3 w-3" />
                  <span className="text-xs">Nilai Lapangan</span>
                </div>
                <div className="font-bold text-purple-700">
                  {summary.fieldSupervisorTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {gradingStatus === "not-graded" ? (
            <Button
              onClick={() => onGiveGrade?.(student.id)}
              className="flex-1"
              variant="default"
            >
              Beri Nilai
            </Button>
          ) : (
            <>
              <Button
                onClick={() => onViewDetail?.(student.id)}
                className="flex-1"
                variant="outline"
              >
                Lihat Detail
              </Button>
              <Button
                onClick={() => onGiveGrade?.(student.id)}
                className="flex-1"
                variant="default"
              >
                Edit Nilai
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
