import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Building2, GraduationCap, Award, CheckCircle2, XCircle } from "lucide-react";

import FieldMentorGradeCard from "../components/field-mentor-grade-card";
import AcademicSupervisorGradeCard from "../components/academic-supervisor-grade-card";
import CombinedGradeCard from "../components/combined-grade-card";
import { MOCK_STUDENT_GRADE } from "../data/mock-data";

export default function StudentGradingPage() {
  // In real implementation, fetch data from API using student ID from auth context
  const studentGrade = MOCK_STUDENT_GRADE;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <Award className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Penilaian Kerja Praktik
            </h1>
            <p className="text-gray-600">
              Lihat hasil penilaian dari mentor lapangan dan dosen pembimbing
            </p>
          </div>
        </div>

        {/* Student Info Card */}
        <Card className="border-t-4 border-t-purple-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={`/avatars/default-avatar.png`}
                  alt={studentGrade.studentName}
                />
                <AvatarFallback className="text-xl bg-purple-100 text-purple-700">
                  {studentGrade.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-bold">
                    {studentGrade.studentName}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <GraduationCap className="h-4 w-4" />
                    NIM: {studentGrade.nim}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{studentGrade.company}</span>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {studentGrade.hasFieldMentorGrade ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      studentGrade.hasFieldMentorGrade
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Mentor Lapangan
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {studentGrade.hasAcademicSupervisorGrade ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span
                    className={
                      studentGrade.hasAcademicSupervisorGrade
                        ? "text-green-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Dosen Pembimbing
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-4" />

        {/* Grading Cards */}
        <div className="space-y-4">
          {/* Card 1: Field Mentor Grade (30%) */}
          <FieldMentorGradeCard grade={studentGrade.fieldMentorGrade} />

          {/* Card 2: Academic Supervisor Grade (70%) */}
          <AcademicSupervisorGradeCard
            grade={studentGrade.academicSupervisorGrade}
          />

          {/* Card 3: Combined Grade */}
          <CombinedGradeCard
            grade={studentGrade.combinedGrade}
            canView={studentGrade.canViewCombinedGrade}
          />
        </div>

        {/* Info Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Informasi Penilaian:</p>
                <p>
                  Nilai akhir = Mentor Lapangan (30%) + Dosen Pembimbing (70%). 
                  Rekap tersedia setelah kedua penilaian selesai.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
