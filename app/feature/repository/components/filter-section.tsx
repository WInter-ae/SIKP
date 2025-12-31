import { Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import type { FilterSectionProps } from "../types";

export function FilterSection({
  filters,
  onFilterChange,
  yearOptions,
  categoryOptions,
}: FilterSectionProps) {
  const semesterOptions = ["Semua", "Ganjil", "Genap"];
  const statusOptions = ["Semua", "draft", "review", "approved", "published"];
  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "popular", label: "Terpopuler" },
    { value: "titleAZ", label: "Judul A-Z" },
    { value: "titleZA", label: "Judul Z-A" },
  ];

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-700">Filter & Urutkan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Year */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Tahun
            </label>
            <Select
              value={filters.year?.toString() || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  year: value === "all" ? undefined : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Periode
            </label>
            <Select
              value={filters.semester || "Semua"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  semester: value === "Semua" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Periode" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Kategori
            </label>
            <Select
              value={filters.category || "Semua"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  category: value === "Semua" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Kategori</SelectItem>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Status
            </label>
            <Select
              value={filters.status || "Semua"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  status: value === "Semua" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "Semua" ? "Semua Status" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Urutkan
            </label>
            <Select
              value={filters.sortBy || "newest"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  sortBy: value as
                    | "newest"
                    | "oldest"
                    | "popular"
                    | "titleAZ"
                    | "titleZA",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
