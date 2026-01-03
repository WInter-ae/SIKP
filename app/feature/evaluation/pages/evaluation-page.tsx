import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { StudentList } from "../components/student-list";
import { MOCK_EVALUATIONS } from "../data/mock-evaluations";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import {
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function EvaluationPage() {
  const navigate = useNavigate();
  const [evaluations] = useState(MOCK_EVALUATIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const handleStudentClick = (id: string) => {
    navigate(`/admin/penilaian/${id}`);
  };

  // Filter and search evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((evaluation) => {
      // Search filter
      const matchesSearch =
        evaluation.student.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        evaluation.student.studentId
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        evaluation.summary.status === statusFilter;

      // Grade filter
      const matchesGrade =
        gradeFilter === "all" || evaluation.summary.grade === gradeFilter;

      return matchesSearch && matchesStatus && matchesGrade;
    });
  }, [evaluations, searchQuery, statusFilter, gradeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEvaluations.length / ITEMS_PER_PAGE);
  const paginatedEvaluations = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvaluations.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvaluations, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Calculate statistics
  const totalStudents = evaluations.length;
  const passedStudents = evaluations.filter(
    (e) => e.summary.status === "passed",
  ).length;
  const averageScore =
    evaluations.reduce((acc, e) => acc + e.summary.finalScore, 0) /
    totalStudents;
  const highestScore = Math.max(
    ...evaluations.map((e) => e.summary.finalScore),
  );

  const stats = [
    {
      title: "Total Mahasiswa",
      value: totalStudents,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Mahasiswa Lulus",
      value: passedStudents,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Rata-rata Nilai",
      value: averageScore.toFixed(2),
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Nilai Tertinggi",
      value: highestScore.toFixed(2),
      icon: Award,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Penilaian Kerja Praktik
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola dan pantau penilaian mahasiswa Kerja Praktik
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="passed">Lulus</SelectItem>
                  <SelectItem value="failed">Tidak Lulus</SelectItem>
                </SelectContent>
              </Select>

              {/* Grade Filter */}
              <Select
                value={gradeFilter}
                onValueChange={(value) => {
                  setGradeFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-full md:w-[200px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                  <SelectValue placeholder="Nilai" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="all">Semua Nilai</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {paginatedEvaluations.length} dari{" "}
              {filteredEvaluations.length} mahasiswa
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Daftar Mahasiswa
          </h2>
          <StudentList
            evaluations={paginatedEvaluations}
            onStudentClick={handleStudentClick}
          />

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
      </div>
    </div>
  );
}
