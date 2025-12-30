import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { SearchBar } from "../components/search-bar";
import { FilterSection } from "../components/filter-section";
import { LaporanList } from "../components/laporan-list";
import type { LaporanKP, FilterOptions } from "../types";

// Data dummy untuk demo
const DUMMY_LAPORAN: LaporanKP[] = [
  {
    id: "1",
    judul:
      "Implementasi Sistem Informasi Manajemen Inventori Berbasis Web pada PT. Teknologi Maju",
    mahasiswa: {
      nama: "Ahmad Rizki Pratama",
      nim: "20011001",
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
    },
    perusahaan: "PT. Teknologi Maju",
    tahun: 2024,
    periode: "Ganjil",
    kategori: "Web Development",
    pembimbing: {
      nama: "Dr. Budi Santoso, M.Kom",
      nidn: "0012345678",
    },
    status: "published",
    tanggalUpload: "2024-12-15",
    tanggalPublish: "2024-12-20",
    abstrak:
      "Penelitian ini membahas tentang implementasi sistem informasi manajemen inventori berbasis web yang bertujuan untuk meningkatkan efisiensi pengelolaan stok barang di PT. Teknologi Maju. Sistem dikembangkan menggunakan framework Laravel dan database MySQL.",
    fileUrl: "/files/laporan-1.pdf",
    thumbnailUrl: "https://picsum.photos/seed/1/200/200",
    downloadCount: 45,
    viewCount: 120,
    tags: ["Laravel", "MySQL", "Inventori", "Web"],
  },
  {
    id: "2",
    judul: "Pengembangan Aplikasi Mobile E-Commerce Menggunakan React Native",
    mahasiswa: {
      nama: "Siti Nurhaliza",
      nim: "20011002",
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
    },
    perusahaan: "CV. Digital Kreatif",
    tahun: 2024,
    periode: "Ganjil",
    kategori: "Mobile Development",
    pembimbing: {
      nama: "Prof. Dr. Ir. Andi Wijaya, M.T.",
      nidn: "0023456789",
    },
    status: "approved",
    tanggalUpload: "2024-11-20",
    abstrak:
      "Aplikasi mobile e-commerce dikembangkan untuk memudahkan pelanggan dalam berbelanja online. Fitur-fitur yang diimplementasikan meliputi katalog produk, keranjang belanja, payment gateway, dan tracking pengiriman.",
    fileUrl: "/files/laporan-2.pdf",
    thumbnailUrl: "https://picsum.photos/seed/2/200/200",
    downloadCount: 32,
    viewCount: 89,
    tags: ["React Native", "E-Commerce", "Mobile"],
  },
  {
    id: "3",
    judul: "Analisis Sentimen Media Sosial Menggunakan Machine Learning",
    mahasiswa: {
      nama: "Muhammad Fahri",
      nim: "20011003",
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fahri",
    },
    perusahaan: "PT. Data Analytics Indonesia",
    tahun: 2023,
    periode: "Genap",
    kategori: "Data Science",
    pembimbing: {
      nama: "Dr. Citra Dewi, S.Kom., M.Sc",
      nidn: "0034567890",
    },
    status: "published",
    tanggalUpload: "2023-06-10",
    tanggalPublish: "2023-06-15",
    abstrak:
      "Penelitian ini menggunakan algoritma machine learning untuk melakukan analisis sentimen pada data media sosial Twitter. Model yang digunakan adalah Naive Bayes dengan akurasi mencapai 87%.",
    fileUrl: "/files/laporan-3.pdf",
    thumbnailUrl: "https://picsum.photos/seed/3/200/200",
    downloadCount: 78,
    viewCount: 234,
    tags: ["Machine Learning", "NLP", "Python", "Twitter"],
  },
  {
    id: "4",
    judul: "Sistem Monitoring IoT untuk Smart Agriculture",
    mahasiswa: {
      nama: "Dewi Kartika",
      nim: "20011004",
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi",
    },
    perusahaan: "PT. Agritech Indonesia",
    tahun: 2024,
    periode: "Ganjil",
    kategori: "IoT",
    pembimbing: {
      nama: "Dr. Eko Prasetyo, M.T.",
      nidn: "0045678901",
    },
    status: "review",
    tanggalUpload: "2024-12-01",
    abstrak:
      "Sistem IoT dikembangkan untuk monitoring kondisi lahan pertanian secara real-time meliputi suhu, kelembaban tanah, dan intensitas cahaya. Data dikirim ke server cloud dan dapat diakses melalui dashboard web.",
    thumbnailUrl: "https://picsum.photos/seed/4/200/200",
    downloadCount: 12,
    viewCount: 45,
    tags: ["IoT", "Arduino", "Agriculture", "Cloud"],
  },
  {
    id: "5",
    judul: "Implementasi Blockchain untuk Supply Chain Management",
    mahasiswa: {
      nama: "Reza Firmansyah",
      nim: "20011005",
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reza",
    },
    perusahaan: "PT. Blockchain Solutions",
    tahun: 2023,
    periode: "Ganjil",
    kategori: "Blockchain",
    pembimbing: {
      nama: "Dr. Fajar Nugroho, S.T., M.Eng",
      nidn: "0056789012",
    },
    status: "published",
    tanggalUpload: "2023-12-10",
    tanggalPublish: "2023-12-18",
    abstrak:
      "Penelitian ini mengimplementasikan teknologi blockchain untuk meningkatkan transparansi dan keamanan dalam supply chain management. Platform yang digunakan adalah Ethereum dengan smart contracts.",
    fileUrl: "/files/laporan-5.pdf",
    thumbnailUrl: "https://picsum.photos/seed/5/200/200",
    downloadCount: 56,
    viewCount: 167,
    tags: ["Blockchain", "Ethereum", "Smart Contract"],
  },
  {
    id: "6",
    judul: "Pengembangan Chatbot Customer Service Menggunakan NLP",
    mahasiswa: {
      nama: "Linda Wijayanti",
      nim: "20011006",
      foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda",
    },
    perusahaan: "PT. Fintech Indonesia",
    tahun: 2024,
    periode: "Genap",
    kategori: "Artificial Intelligence",
    pembimbing: {
      nama: "Prof. Dr. Gunawan Santoso, M.Kom",
      nidn: "0067890123",
    },
    status: "draft",
    tanggalUpload: "2024-12-28",
    abstrak:
      "Chatbot dikembangkan menggunakan teknologi Natural Language Processing untuk menangani pertanyaan pelanggan secara otomatis. Implementasi menggunakan framework Rasa dan BERT model.",
    thumbnailUrl: "https://picsum.photos/seed/6/200/200",
    downloadCount: 5,
    viewCount: 18,
    tags: ["NLP", "Chatbot", "AI", "Rasa"],
  },
];

export default function RepositoryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "terbaru",
  });

  // Extract unique options for filters
  const tahunOptions = useMemo(() => {
    const years = DUMMY_LAPORAN.map((l) => l.tahun);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, []);

  const kategoriOptions = useMemo(() => {
    const categories = DUMMY_LAPORAN.map((l) => l.kategori);
    return Array.from(new Set(categories)).sort();
  }, []);

  // Filter and sort laporan
  const filteredLaporan = useMemo(() => {
    let result = [...DUMMY_LAPORAN];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.judul.toLowerCase().includes(query) ||
          l.mahasiswa.nama.toLowerCase().includes(query) ||
          l.mahasiswa.nim.includes(query) ||
          l.perusahaan.toLowerCase().includes(query) ||
          l.kategori.toLowerCase().includes(query) ||
          l.abstrak.toLowerCase().includes(query) ||
          l.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply filters
    if (filters.tahun) {
      result = result.filter((l) => l.tahun === filters.tahun);
    }
    if (filters.periode) {
      result = result.filter((l) => l.periode === filters.periode);
    }
    if (filters.kategori) {
      result = result.filter((l) => l.kategori === filters.kategori);
    }
    if (filters.status) {
      result = result.filter((l) => l.status === filters.status);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "terbaru":
        result.sort(
          (a, b) =>
            new Date(b.tanggalUpload).getTime() -
            new Date(a.tanggalUpload).getTime(),
        );
        break;
      case "terlama":
        result.sort(
          (a, b) =>
            new Date(a.tanggalUpload).getTime() -
            new Date(b.tanggalUpload).getTime(),
        );
        break;
      case "terpopuler":
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "judulAZ":
        result.sort((a, b) => a.judul.localeCompare(b.judul));
        break;
      case "judulZA":
        result.sort((a, b) => b.judul.localeCompare(a.judul));
        break;
    }

    return result;
  }, [searchQuery, filters]);

  const handleLaporanClick = (id: string) => {
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
          tahunOptions={tahunOptions}
          kategoriOptions={kategoriOptions}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan{" "}
            <span className="font-semibold">{filteredLaporan.length}</span> dari{" "}
            <span className="font-semibold">{DUMMY_LAPORAN.length}</span>{" "}
            laporan
          </p>
        </div>

        {/* Laporan List */}
        <LaporanList
          laporan={filteredLaporan}
          onLaporanClick={handleLaporanClick}
        />
      </div>
    </div>
  );
}
