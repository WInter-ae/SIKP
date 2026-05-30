import { useState, useMemo, useEffect } from "react";
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
import type { StudentGradingInfo, GradingStatus } from "../types";
import { getDosenLogbookMonitorItems } from "../services/logbook-monitor-api";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 6;

export default function DosenGradingListPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState<StudentGradingInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [revisionFilter, setRevisionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Load real data from API
  useEffect(() => {
    async function loadMentees() {
      setIsLoading(true);
      try {
        const response = await getDosenLogbookMonitorItems();
        if (response.success && response.data) {
          // Map DosenLogbookMonitorItem to StudentGradingInfo
          const mapped: StudentGradingInfo[] = response.data.map(item => ({
            student: {
              id: item.studentId || item.id,
              name: item.studentName,
              studentId: item.nim,
              photo: "", // Optional in real API
              company: item.company,
              fieldSupervisor: item.mentorName || "Belum ditentukan",
              internPeriod: {
                start: item.date, // Using available date as fallback
                end: item.date,
              },
            },
            // Logic to determine status (mock logic if backend doesn't provide grading status yet)
            gradingStatus: item.status === "APPROVED" ? "not-graded" as GradingStatus : "pending" as GradingStatus,
            revisionStatus: "belum-direvisi",
          }));
          setStudents(mapped);
        } else {
          toast.error(response.message || "Gagal memuat data mahasiswa bimbingan");
        }
      } catch (error) {
        console.error("Error loading mentees:", error);
        toast.error("Terjadi kesalahan sistem saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    loadMentees();
  }, []);

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

      // Revision filter
      const matchesRevision =
        revisionFilter === "all" || student.revisionStatus === revisionFilter;

      return matchesSearch && matchesStatus && matchesRevision;
    });
  }, [students, searchQuery, statusFilter, revisionFilter]);

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
          <Card className="">
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
              <p className="text-xs text-gray-500 mt-1">
                Mahasiswa bimbingan
              </p>
            </CardContent>
          </Card>

          <Card className="">
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

          <Card className="">
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
              <p className="text-xs text-gray-500 mt-1">
                Menunggu penilaian
              </p>
            </CardContent>
          </Card>

          <Card className="">
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

        {/* Search and Filters */}
        <Card className="">
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
                  className="pl-10"
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
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status Penilaian" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="graded">Sudah Dinilai</SelectItem>
                  <SelectItem value="not-graded">Belum Dinilai</SelectItem>
                </SelectContent>
              </Select>

              {/* Revision Filter */}
              <Select
                value={revisionFilter}
                onValueChange={(value) => {
                  setRevisionFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status Revisi" />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="all">Semua Revisi</SelectItem>
                  <SelectItem value="sudah-direvisi">Sudah Direvisi</SelectItem>
                  <SelectItem value="proses">Proses</SelectItem>
                  <SelectItem value="belum-direvisi">Belum Direvisi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Menampilkan {paginatedStudents.length} dari{" "}
              {filteredStudents.length} mahasiswa
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Daftar Mahasiswa Bimbingan
          </h2>

          {students.length === 0 ? (
            <Card className="p-12 border-dashed border-2 bg-gray-50/50">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Users className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Belum Ada Mahasiswa yang Upload Laporan
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Daftar mahasiswa akan muncul secara otomatis di sini setelah mereka mengunggah Laporan
                  Kerja Praktik pada halaman Pasca Magang.
                </p>
              </div>
            </Card>
          ) : filteredStudents.length === 0 ? (
            <Card className="p-12 border-dashed border-2 bg-gray-50/50">
              <div className="text-center max-w-md mx-auto">
                <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="h-12 w-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Tidak Ada Hasil Pencarian
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Kami tidak menemukan mahasiswa yang sesuai dengan kata kunci "{searchQuery}" atau filter yang Anda pilih.
                </p>
              </div>
            </Card>
          ) : (
            <>
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
                  <div className="text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className=""
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
                      className=""
                    >
                      Berikutnya
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
