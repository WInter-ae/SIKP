import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar, User, Eye } from "lucide-react";

import type { AcademicSupervisorGrade } from "../types/index.d";

interface AcademicSupervisorGradeCardProps {
  grade?: AcademicSupervisorGrade;
}

export default function AcademicSupervisorGradeCard({
  grade,
}: AcademicSupervisorGradeCardProps) {
  if (!grade) {
    return (
      <Card className="border-l-4 border-l-gray-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              Penilaian Dosen Pembimbing KP
            </CardTitle>
            <Badge variant="secondary">Belum Dinilai</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Penilaian dari dosen pembimbing KP belum tersedia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Penilaian Dosen Pembimbing KP</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500">Sudah Dinilai</Badge>
            {grade.pdfUrl && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => window.open(grade.pdfUrl, '_blank')}
              >
                <Eye className="h-4 w-4" />
                Preview PDF
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Score Summary */}
        <div className="bg-green-50 dark:bg-green-950 rounded-md p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Total Skor</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">
                {grade.totalScore.toFixed(2)} / {grade.maxScore}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bobot (70%)</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-400">
                {grade.weightedScore.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Categories Summary */}
        <div className="space-y-1.5">
          {grade.categories.map((category, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-muted/50 rounded text-sm">
              <span>{category.category}</span>
              <span className="font-semibold">
                {category.totalScore} / {category.maxScore}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {grade.notes && (
          <div className="text-xs text-muted-foreground italic">
            {grade.notes}
          </div>
        )}

        {/* Graded Info */}
        {grade.gradedAt && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(grade.gradedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {grade.gradedBy && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{grade.gradedBy}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
