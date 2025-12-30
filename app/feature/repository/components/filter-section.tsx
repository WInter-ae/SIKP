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
  tahunOptions,
  kategoriOptions,
}: FilterSectionProps) {
  const periodeOptions = ["Semua", "Ganjil", "Genap"];
  const statusOptions = ["Semua", "draft", "review", "approved", "published"];
  const sortOptions = [
    { value: "terbaru", label: "Terbaru" },
    { value: "terlama", label: "Terlama" },
    { value: "terpopuler", label: "Terpopuler" },
    { value: "judulAZ", label: "Judul A-Z" },
    { value: "judulZA", label: "Judul Z-A" },
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
          {/* Tahun */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Tahun
            </label>
            <Select
              value={filters.tahun?.toString() || "all"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  tahun: value === "all" ? undefined : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun</SelectItem>
                {tahunOptions.map((tahun) => (
                  <SelectItem key={tahun} value={tahun.toString()}>
                    {tahun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Periode */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Periode
            </label>
            <Select
              value={filters.periode || "Semua"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  periode: value === "Semua" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Periode" />
              </SelectTrigger>
              <SelectContent>
                {periodeOptions.map((periode) => (
                  <SelectItem key={periode} value={periode}>
                    {periode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Kategori */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Kategori
            </label>
            <Select
              value={filters.kategori || "Semua"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  kategori: value === "Semua" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua Kategori</SelectItem>
                {kategoriOptions.map((kategori) => (
                  <SelectItem key={kategori} value={kategori}>
                    {kategori}
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
              value={filters.sortBy || "terbaru"}
              onValueChange={(value) =>
                onFilterChange({
                  ...filters,
                  sortBy: value as
                    | "terbaru"
                    | "terlama"
                    | "terpopuler"
                    | "judulAZ"
                    | "judulZA",
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
