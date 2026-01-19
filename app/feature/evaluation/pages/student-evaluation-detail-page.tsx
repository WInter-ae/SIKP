import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Calendar, Building2, User, Award } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { GradeSection } from "../components/grade-section";
import { MOCK_EVALUATIONS } from "../data/mock-evaluations";

export default function StudentEvaluationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const evaluation = MOCK_EVALUATIONS.find((e) => e.student.id === id);

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Data Tidak Ditemukan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Data penilaian mahasiswa yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => navigate("/admin/penilaian")}>
              Kembali ke Daftar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    student,
    fieldSupervisorGrades,
    academicSupervisorGrades,
    summary,
    notes,
    evaluatedAt,
  } = evaluation;

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/penilaian")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Daftar Penilaian
        </Button>

        {/* Student Header */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={student.photo} alt={student.name} />
                  <AvatarFallback className="text-2xl dark:bg-gray-700 dark:text-gray-200">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2 dark:text-gray-100">
                    {student.name}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{student.studentId}</p>
                  <div className="flex gap-2">
                    <Badge
                      className={`${getGradeBadgeColor(summary.grade)} font-bold text-lg px-4 py-1`}
                    >
                      Grade {summary.grade}
                    </Badge>
                    <Badge
                      className={`${getStatusBadgeColor(summary.status)} text-lg px-4 py-1`}
                    >
                      {getStatusText(summary.status)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-700 dark:text-green-400">
                  {summary.finalScore.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Nilai Akhir</div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span>Perusahaan</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{student.company}</p>
              </div>

              {/* Intern Period */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Periode Magang</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(student.internPeriod.start).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}{" "}
                  -{" "}
                  {new Date(student.internPeriod.end).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>

              {/* Field Supervisor */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <User className="h-4 w-4" />
                  <span>Pembimbing Lapangan</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {student.supervisor}
                </p>
              </div>

              {/* Academic Supervisor */}
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <Award className="h-4 w-4" />
                  <span>Dosen Pembimbing</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {student.academicSupervisor}
                </p>
              </div>
            </div>

            {evaluatedAt && (
              <>
                <Separator />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Tanggal Penilaian
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(evaluatedAt).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Grade Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field Supervisor Grades */}
          <GradeSection
            title="Penilaian Pembimbing Lapangan"
            grades={fieldSupervisorGrades}
            totalScore={summary.fieldSupervisorTotal}
            maxScore={100}
          />

          {/* Academic Supervisor Grades */}
          <GradeSection
            title="Penilaian Dosen Pembimbing"
            grades={academicSupervisorGrades}
            totalScore={summary.academicSupervisorTotal}
            maxScore={100}
          />
        </div>

        {/* Final Summary */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Rekap Nilai Akhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400 mb-2">
                  {summary.fieldSupervisorTotal.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Nilai Pembimbing Lapangan
                </div>
              </div>
              <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                  {summary.academicSupervisorTotal.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Nilai Dosen Pembimbing
                </div>
              </div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-500 dark:border-green-600">
                <div className="text-4xl font-bold text-green-700 dark:text-green-400 mb-2">
                  {summary.finalScore.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  Nilai Akhir (Grade {summary.grade})
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {notes && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Catatan Penilaian</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
