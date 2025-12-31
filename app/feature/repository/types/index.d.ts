export interface Report {
  id: string;
  title: string;
  student: {
    name: string;
    studentId: string;
    photo?: string;
  };
  company: string;
  year: number;
  semester: string; // "Ganjil" | "Genap"
  category: string; // "Web Development", "Mobile", "Data Science", etc.
  supervisor: {
    name: string;
    nidn: string;
  };
  status: "draft" | "review" | "approved" | "published";
  uploadDate: string;
  publishDate?: string;
  abstract: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  downloadCount: number;
  viewCount: number;
  tags?: string[];
}

export interface FilterOptions {
  year?: number;
  semester?: string;
  category?: string;
  status?: string;
  sortBy?: "newest" | "oldest" | "popular" | "titleAZ" | "titleZA";
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FilterSectionProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  yearOptions: number[];
  categoryOptions: string[];
}

export interface ReportCardProps {
  report: Report;
  onClick: (id: string) => void;
}

export interface ReportListProps {
  reports: Report[];
  isLoading?: boolean;
  onReportClick: (id: string) => void;
}
