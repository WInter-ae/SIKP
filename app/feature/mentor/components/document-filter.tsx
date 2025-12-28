import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";

interface DocumentFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterSemester: string;
  onFilterSemesterChange: (value: string) => void;
  semesters: string[];
}

function DocumentFilter({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterSemester,
  onFilterSemesterChange,
  semesters,
}: DocumentFilterProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Filter & Pencarian</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Cari
            </label>
            <Input
              placeholder="Cari berdasarkan judul atau nama..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Tipe Dokumen
            </label>
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="penilaian">Penilaian</SelectItem>
                <SelectItem value="logbook">Logbook</SelectItem>
                <SelectItem value="laporan">Laporan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Semester
            </label>
            <Select value={filterSemester} onValueChange={onFilterSemesterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Semua semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Semester</SelectItem>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentFilter;
