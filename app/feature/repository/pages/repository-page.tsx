import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { SearchBar } from "../components/search-bar";
import { FilterSection } from "../components/filter-section";
import { ReportList } from "../components/report-list";
import { MOCK_REPORTS } from "../data/mock-reports";
import type { FilterOptions } from "../types";

export default function RepositoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "newest",
  });

  // Extract unique options for filters
  const yearOptions = useMemo(() => {
    const years = MOCK_REPORTS.map((report) => report.year);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = MOCK_REPORTS.map((report) => report.category);
    return Array.from(new Set(categories)).sort();
  }, []);

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let result = [...MOCK_REPORTS];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.student.name.toLowerCase().includes(query) ||
          report.student.studentId.includes(query) ||
          report.company.toLowerCase().includes(query) ||
          report.category.toLowerCase().includes(query) ||
          report.abstract.toLowerCase().includes(query) ||
          report.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply filters
    if (filters.year) {
      result = result.filter((report) => report.year === filters.year);
    }
    if (filters.semester) {
      result = result.filter((report) => report.semester === filters.semester);
    }
    if (filters.category) {
      result = result.filter((report) => report.category === filters.category);
    }
    if (filters.status) {
      result = result.filter((report) => report.status === filters.status);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() -
            new Date(a.uploadDate).getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.uploadDate).getTime() -
            new Date(b.uploadDate).getTime(),
        );
        break;
      case "popular":
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "titleAZ":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleZA":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [searchQuery, filters]);

  const handleReportClick = (id: string) => {
    navigate(`/mahasiswa/repositori/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Repositori Laporan KP
          </h1>
          <p className="text-gray-600">
            Temukan dan pelajari laporan Kerja Praktik dari mahasiswa
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Filters */}
        <FilterSection
          filters={filters}
          onFilterChange={setFilters}
          yearOptions={yearOptions}
          categoryOptions={categoryOptions}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-semibold">{filteredReports.length}</span> dari{" "}
            <span className="font-semibold">{MOCK_REPORTS.length}</span>{" "}
            laporan
          </p>
        </div>

        {/* Reports List */}
        <ReportList reports={filteredReports} onReportClick={handleReportClick} />
      </div>
    </div>
  );
}
