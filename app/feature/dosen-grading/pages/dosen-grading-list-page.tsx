import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { StudentGradingCard } from "../components/student-grading-card";
import { MOCK_STUDENTS_FOR_GRADING } from "../data/mock-students";

const ITEMS_PER_PAGE = 6;

export default function DosenGradingListPage() {
  const navigate = useNavigate();

  const students = MOCK_STUDENTS_FOR_GRADING;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter students based on search and status
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search filter
      const matchesSearch =
        student.student.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        student.student.studentId
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" || student.gradingStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Penilaian Kerja Praktik
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola penilaian mahasiswa bimbingan Anda
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Mahasiswa
              </CardTitle>
              <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {totalStudents}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mahasiswa bimbingan
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sudah Dinilai
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {gradedStudents}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {((gradedStudents / totalStudents) * 100).toFixed(0)}% dari
                total
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Belum Dinilai
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {notGradedStudents}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Menunggu penilaian
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rata-rata Nilai
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {averageScore.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Dari {gradedStudents} mahasiswa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari nama atau NIM mahasiswa..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="Status Penilaian" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="graded">Sudah Dinilai</SelectItem>
                  <SelectItem value="not-graded">Belum Dinilai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {paginatedStudents.length} dari{" "}
              {filteredStudents.length} mahasiswa
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Daftar Mahasiswa Bimbingan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStudents.map((studentInfo) => (
              <StudentGradingCard
                key={studentInfo.student.id}
                studentInfo={studentInfo}
                onGiveGrade={handleGiveGrade}
                onViewDetail={handleViewDetail}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <Card className="p-12 dark:bg-gray-800 dark:border-gray-700">
            <div className="text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Tidak Ada Mahasiswa Ditemukan
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
