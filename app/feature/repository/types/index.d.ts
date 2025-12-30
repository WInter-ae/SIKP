export interface LaporanKP {
  id: string;
  judul: string;
  mahasiswa: {
    nama: string;
    nim: string;
    foto?: string;
  };
  perusahaan: string;
  tahun: number;
  periode: string; // "Ganjil" | "Genap"
  kategori: string; // "Web Development", "Mobile", "Data Science", etc.
  pembimbing: {
    nama: string;
    nidn: string;
  };
  status: "draft" | "review" | "approved" | "published";
  tanggalUpload: string;
  tanggalPublish?: string;
  abstrak: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  downloadCount: number;
  viewCount: number;
  tags?: string[];
}

export interface FilterOptions {
  tahun?: number;
  periode?: string;
  kategori?: string;
  status?: string;
  sortBy?: "terbaru" | "terlama" | "terpopuler" | "judulAZ" | "judulZA";
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface FilterSectionProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  tahunOptions: number[];
  kategoriOptions: string[];
}

export interface LaporanCardProps {
  laporan: LaporanKP;
  onClick: (id: string) => void;
}

export interface LaporanListProps {
  laporan: LaporanKP[];
  isLoading?: boolean;
  onLaporanClick: (id: string) => void;
}
