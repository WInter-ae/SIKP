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
