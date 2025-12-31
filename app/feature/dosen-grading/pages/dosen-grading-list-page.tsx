import { useNavigate } from "react-router";
import { Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { StudentGradingCard } from "../components/student-grading-card";
import { MOCK_STUDENTS_FOR_GRADING } from "../data/mock-students";

export default function DosenGradingListPage() {
  const navigate = useNavigate();

  const students = MOCK_STUDENTS_FOR_GRADING;

  // Calculate statistics
  const totalStudents = students.length;
  const gradedStudents = students.filter(
    (s) => s.gradingStatus === "graded",
  ).length;
  const notGradedStudents = students.filter(
    (s) => s.gradingStatus === "not-graded",
  ).length;
  const averageScore =
    students
      .filter((s) => s.summary)
      .reduce((sum, s) => sum + (s.summary?.finalScore || 0), 0) /
      gradedStudents || 0;

  const handleGiveGrade = (studentId: string) => {
    navigate(`/dosen/penilaian/beri-nilai/${studentId}`);
  };

  const handleViewDetail = (studentId: string) => {
    navigate(`/dosen/penilaian/detail/${studentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Penilaian Kerja Praktik
          </h1>
          <p className="text-gray-600">
            Kelola penilaian mahasiswa bimbingan Anda
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Mahasiswa
              </CardTitle>
              <Users className="h-5 w-5 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalStudents}
              </div>
              <p className="text-xs text-gray-500 mt-1">Mahasiswa bimbingan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sudah Dinilai
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {gradedStudents}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((gradedStudents / totalStudents) * 100).toFixed(0)}% dari
                total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Belum Dinilai
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {notGradedStudents}
              </div>
              <p className="text-xs text-gray-500 mt-1">Menunggu penilaian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rata-rata Nilai
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {averageScore.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dari {gradedStudents} mahasiswa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Students List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Daftar Mahasiswa Bimbingan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((studentInfo) => (
              <StudentGradingCard
                key={studentInfo.student.id}
                studentInfo={studentInfo}
                onGiveGrade={handleGiveGrade}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {students.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Mahasiswa Bimbingan
              </h3>
              <p className="text-gray-600">
                Saat ini Anda belum memiliki mahasiswa bimbingan yang terdaftar.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
