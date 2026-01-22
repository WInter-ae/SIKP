import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Award, TrendingUp, Lock } from "lucide-react";

import type { CombinedGrade } from "../types/index.d";

interface CombinedGradeCardProps {
  grade?: CombinedGrade;
  canView: boolean;
}

export default function CombinedGradeCard({ grade, canView }: CombinedGradeCardProps) {
  const getGradeColor = (gradeValue: string) => {
    switch (gradeValue) {
      case "A":
        return "text-green-600 bg-green-50";
      case "B":
        return "text-blue-600 bg-blue-50";
      case "C":
        return "text-yellow-600 bg-yellow-50";
      case "D":
        return "text-orange-600 bg-orange-50";
      case "E":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "lulus") {
      return <Badge className="bg-green-500 text-white">LULUS</Badge>;
    }
    return <Badge className="bg-red-500 text-white">TIDAK LULUS</Badge>;
  };

  if (!canView) {
    return (
      <Card className="border-l-4 border-l-gray-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Rekap Nilai Akhir</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Terkunci
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-muted/50 rounded-lg text-center space-y-3">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <p className="font-medium">Rekap Terkunci</p>
              <p className="text-xs text-muted-foreground">
                Rekap nilai akan tersedia setelah kedua penilaian selesai
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!grade) {
    return (
      <Card className="border-l-4 border-l-gray-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Rekap Nilai Akhir</CardTitle>
            <Badge variant="secondary">Belum Tersedia</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Rekap nilai akhir belum tersedia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-purple-500 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Award className="h-6 w-6 text-purple-600" />
            Rekap Nilai Akhir
          </CardTitle>
          {getStatusBadge(grade.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grade Badge */}
        <div className="text-center py-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-4xl font-bold ${getGradeColor(grade.grade)}`}
          >
            {grade.grade}
          </div>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Nilai Huruf
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-2">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">
                Mentor Lapangan (30%)
              </span>
              <TrendingUp className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {grade.fieldMentorScore.toFixed(2)}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 rounded-md p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">
                Dosen Pembimbing (70%)
              </span>
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {grade.academicSupervisorScore.toFixed(2)}
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-950 rounded-md p-3 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">
                Total Nilai
              </span>
              <Award className="h-3 w-3 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
              {grade.totalScore.toFixed(2)}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-950 rounded-md p-3 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">
                Rata-rata Nilai
              </span>
              <Award className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {grade.averageScore.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Remarks */}
        {grade.remarks && (
          <div className="text-xs text-muted-foreground italic bg-muted/50 p-2 rounded">
            {grade.remarks}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
