import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import {
  Info,
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FileEdit,
} from "lucide-react";
import type { PengajuanJudul } from "../types/judul";
import { PengajuanJudulCard } from "../components/pengajuan-judul-card";

// Mock data pengajuan judul dari mahasiswa
const mockPengajuanList: PengajuanJudul[] = [
  {
    id: "JDL-001",
    mahasiswa: {
      id: "MHS-001",
      nama: "Budi Santoso",
      nim: "12345001",
      prodi: "Teknik Informatika",
      email: "budi.santoso@student.ac.id",
    },
    tim: {
      id: "TIM-001",
      nama: "Frontend Dev Team",
      anggota: ["Budi Santoso", "Siti Rahayu"],
    },
    data: {
      judulLaporan:
        "Sistem Informasi Manajemen Perpustakaan Berbasis Web dengan Teknologi React dan Node.js",
      judulInggris:
        "Web-Based Library Management Information System Using React and Node.js Technology",
      tempatMagang: "PT Maju Bersama Indonesia",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Proyek ini bertujuan untuk membangun sistem informasi manajemen perpustakaan yang modern dan user-friendly. Sistem akan memiliki fitur peminjaman buku, pengembalian, katalog online, dan laporan statistik. Menggunakan React untuk frontend dan Node.js dengan Express untuk backend API.",
      metodologi:
        "Pengembangan menggunakan metode Agile dengan sprint 2 minggu. Teknologi: React, TypeScript, Node.js, PostgreSQL, dan Docker untuk deployment.",
      teknologi: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Docker"],
    },
    status: "submitted",
    tanggalPengajuan: "2024-11-20T09:30:00",
  },
  {
    id: "JDL-002",
    mahasiswa: {
      id: "MHS-002",
      nama: "Siti Rahayu",
      nim: "12345002",
      prodi: "Sistem Informasi",
    },
    data: {
      judulLaporan:
        "Implementasi Aplikasi Mobile E-Commerce dengan Fitur Augmented Reality untuk Visualisasi Produk",
      tempatMagang: "CV Digital Creative Solutions",
      periode: {
        mulai: "2024-09-15",
        selesai: "2024-12-15",
      },
      deskripsi:
        "Pengembangan aplikasi e-commerce mobile yang memanfaatkan teknologi AR untuk membantu customer memvisualisasikan produk furniture sebelum membeli. Aplikasi akan dibangun menggunakan React Native dan ARCore.",
      teknologi: ["React Native", "ARCore", "Firebase", "Redux"],
    },
    status: "submitted",
    tanggalPengajuan: "2024-11-21T14:20:00",
  },
  {
    id: "JDL-003",
    mahasiswa: {
      id: "MHS-003",
      nama: "Ahmad Fauzi",
      nim: "12345003",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan:
        "Sistem Prediksi Cuaca Menggunakan Machine Learning dengan Algoritma Random Forest",
      tempatMagang: "BMKG Regional Jawa Timur",
      periode: {
        mulai: "2024-08-01",
        selesai: "2024-11-30",
      },
      deskripsi:
        "Implementasi sistem prediksi cuaca menggunakan machine learning untuk meningkatkan akurasi peramalan. Data historis cuaca akan dianalisis dan digunakan untuk melatih model Random Forest.",
      teknologi: ["Python", "Scikit-learn", "Pandas", "Flask", "PostgreSQL"],
    },
    status: "submitted",
    tanggalPengajuan: "2024-11-19T10:00:00",
  },
  {
    id: "JDL-004",
    mahasiswa: {
      id: "MHS-004",
      nama: "Dewi Lestari",
      nim: "12345004",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan:
        "Pengembangan Dashboard Analytics untuk Monitoring Performa Website E-Learning",
      tempatMagang: "PT Edukasi Digital Indonesia",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Membangun dashboard analytics real-time untuk memonitor berbagai metrik performa website e-learning seperti jumlah user aktif, engagement rate, dan conversion rate.",
      teknologi: ["Vue.js", "D3.js", "Node.js", "MongoDB", "Redis"],
    },
    status: "approved",
    tanggalPengajuan: "2024-11-15T08:30:00",
    tanggalVerifikasi: "2024-11-18T10:00:00",
    catatanDosen:
      "Judul sudah bagus dan jelas. Pastikan fokus pada implementasi visualisasi data yang menarik dan informatif. Sertakan analisis perbandingan dengan tools analytics yang sudah ada.",
  },
  {
    id: "JDL-005",
    mahasiswa: {
      id: "MHS-005",
      nama: "Rudi Hartono",
      nim: "12345005",
      prodi: "Sistem Informasi",
    },
    data: {
      judulLaporan: "Aplikasi Chatbot Customer Service Berbasis AI",
      tempatMagang: "PT Bank Digital Nusantara",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Pengembangan chatbot AI untuk menangani pertanyaan customer service secara otomatis menggunakan natural language processing.",
      teknologi: ["Python", "TensorFlow", "FastAPI", "React"],
    },
    status: "revision",
    tanggalPengajuan: "2024-11-17T13:00:00",
    tanggalVerifikasi: "2024-11-22T09:00:00",
    catatanDosen:
      "Judul terlalu umum. Tolong spesifikkan teknologi AI yang digunakan (NLP, LLM, dll) dan domain spesifik dalam banking yang ditangani. Contoh: 'Aplikasi Chatbot Customer Service Berbasis Natural Language Processing untuk Layanan Informasi Rekening'.",
    revisi: {
      count: 1,
      history: [
        {
          tanggal: "2024-11-22T09:00:00",
          catatan:
            "Judul terlalu umum. Tolong spesifikkan teknologi AI yang digunakan dan domain spesifik dalam banking yang ditangani.",
        },
      ],
    },
  },
  {
    id: "JDL-006",
    mahasiswa: {
      id: "MHS-006",
      nama: "Lisa Permata",
      nim: "12345006",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan: "Website Pemesanan Tiket Online",
      tempatMagang: "CV Startup Travel Indonesia",
      periode: {
        mulai: "2024-09-01",
        selesai: "2024-12-01",
      },
      deskripsi:
        "Membuat website untuk pemesanan tiket pesawat dan hotel secara online dengan integrasi payment gateway.",
      teknologi: ["PHP", "Laravel", "MySQL", "Bootstrap"],
    },
    status: "rejected",
    tanggalPengajuan: "2024-11-16T11:00:00",
    tanggalVerifikasi: "2024-11-20T14:00:00",
    catatanDosen:
      "Judul terlalu sederhana dan tidak menunjukkan kontribusi teknis yang signifikan. Website pemesanan tiket adalah aplikasi umum yang sudah banyak ada. Harap ajukan judul baru yang menunjukkan inovasi atau fokus pada aspek teknis tertentu, misalnya: sistem rekomendasi, optimasi harga dinamis, atau implementasi microservices architecture.",
  },
];

function VerifikasiJudulDosenPage() {
  const [pengajuanList, setPengajuanList] = useState<PengajuanJudul[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menunggu");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load data pengajuan
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPengajuanList(mockPengajuanList);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleVerifikasi = (
    id: string,
    status: "approved" | "rejected" | "revision",
    catatan: string
  ) => {
    setPengajuanList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newRevisi =
            status === "revision"
              ? {
                  count: (p.revisi?.count || 0) + 1,
                  history: [
                    ...(p.revisi?.history || []),
                    {
                      tanggal: new Date().toISOString(),
                      catatan,
                    },
                  ],
                }
              : p.revisi;

          return {
            ...p,
            status,
            tanggalVerifikasi: new Date().toISOString(),
            catatanDosen: catatan,
            revisi: newRevisi,
          };
        }
        return p;
      })
    );

    // Show notification
    const notificationMap = {
      approved: {
        title: "✅ Judul Disetujui",
        description:
          "Judul laporan telah disetujui. Mahasiswa akan menerima notifikasi.",
      },
      rejected: {
        title: "❌ Judul Ditolak",
        description:
          "Judul laporan ditolak. Mahasiswa diminta untuk mengajukan judul baru.",
      },
      revision: {
        title: "📝 Revisi Diperlukan",
        description:
          "Mahasiswa diminta untuk merevisi judul sesuai catatan yang diberikan.",
      },
    };

    setNotification(notificationMap[status]);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter pengajuan berdasarkan status
  const pengajuanMenunggu = pengajuanList.filter(
    (p) => p.status === "submitted"
  );
  const pengajuanDisetujui = pengajuanList.filter(
    (p) => p.status === "approved"
  );
  const pengajuanRevisi = pengajuanList.filter((p) => p.status === "revision");
  const pengajuanDitolak = pengajuanList.filter((p) => p.status === "rejected");

  // Filter berdasarkan search query
  const filterBySearch = (list: PengajuanJudul[]) => {
    if (!searchQuery.trim()) return list;
    
    const query = searchQuery.toLowerCase();
    return list.filter(
      (p) =>
        p.mahasiswa.nama.toLowerCase().includes(query) ||
        p.mahasiswa.nim.toLowerCase().includes(query) ||
        p.data.judulLaporan.toLowerCase().includes(query) ||
        p.data.tempatMagang.toLowerCase().includes(query)
    );
  };

  const filteredMenunggu = filterBySearch(pengajuanMenunggu);
  const filteredDisetujui = filterBySearch(pengajuanDisetujui);
  const filteredRevisi = filterBySearch(pengajuanRevisi);
  const filteredDitolak = filterBySearch(pengajuanDitolak);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">
                Memuat data pengajuan judul...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Verifikasi Judul Laporan KP
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tinjau dan verifikasi judul laporan kerja praktek yang diajukan oleh
            mahasiswa bimbingan Anda
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <Alert className="border-l-4 border-l-primary">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>{notification.title}</strong>
              <br />
              {notification.description}
            </AlertDescription>
          </Alert>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Panduan Verifikasi Judul:
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200 leading-relaxed">
                  <li>
                    Pastikan judul mencerminkan isi dan ruang lingkup pekerjaan
                    dengan jelas
                  </li>
                  <li>
                    Judul harus spesifik, tidak terlalu umum atau terlalu teknis
                  </li>
                  <li>
                    Perhatikan penggunaan teknologi dan metodologi yang disebutkan
                  </li>
                  <li>
                    Berikan feedback konstruktif untuk membantu mahasiswa
                    berkembang
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cari berdasarkan nama, NIM, judul, atau tempat magang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Menunggu</p>
                  <p className="text-xl sm:text-2xl font-bold">{pengajuanMenunggu.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Disetujui</p>
                  <p className="text-xl sm:text-2xl font-bold">{pengajuanDisetujui.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Revisi</p>
                  <p className="text-xl sm:text-2xl font-bold">{pengajuanRevisi.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <FileEdit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Ditolak</p>
                  <p className="text-xl sm:text-2xl font-bold">{pengajuanDitolak.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-red-100 dark:bg-red-900">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="menunggu" className="relative text-xs sm:text-sm">
              <span className="hidden sm:inline">Menunggu Verifikasi</span>
              <span className="sm:hidden">Menunggu</span>
              {pengajuanMenunggu.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-yellow-500 text-xs px-1.5">
                  {pengajuanMenunggu.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="disetujui" className="text-xs sm:text-sm">
              Disetujui
              {pengajuanDisetujui.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-green-500 text-xs px-1.5">
                  {pengajuanDisetujui.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="revisi" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Perlu Revisi</span>
              <span className="sm:hidden">Revisi</span>
              {pengajuanRevisi.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-blue-500 text-xs px-1.5">
                  {pengajuanRevisi.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ditolak" className="text-xs sm:text-sm">
              Ditolak
              {pengajuanDitolak.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-red-500 text-xs px-1.5">
                  {pengajuanDitolak.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Menunggu Verifikasi */}
          <TabsContent value="menunggu" className="space-y-4 mt-6">
            {filteredMenunggu.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 dark:text-yellow-300" />
                    </div>
                    <p className="text-base sm:text-lg font-medium text-muted-foreground">
                      {searchQuery
                        ? "Tidak ada pengajuan yang sesuai pencarian"
                        : "Tidak ada pengajuan yang menunggu verifikasi"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery
                        ? "Coba gunakan kata kunci yang berbeda"
                        : "Semua pengajuan telah diverifikasi"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  Menampilkan {filteredMenunggu.length} pengajuan
                </div>
                {filteredMenunggu.map((pengajuan) => (
                  <PengajuanJudulCard
                    key={pengajuan.id}
                    pengajuan={pengajuan}
                    onVerifikasi={handleVerifikasi}
                  />
                ))}
              </>
            )}
          </TabsContent>

          {/* Disetujui */}
          <TabsContent value="disetujui" className="space-y-4 mt-6">
            {filteredDisetujui.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-300" />
                    </div>
                    <p className="text-base sm:text-lg font-medium text-muted-foreground">
                      {searchQuery
                        ? "Tidak ada pengajuan yang sesuai pencarian"
                        : "Belum ada judul yang disetujui"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  Menampilkan {filteredDisetujui.length} pengajuan
                </div>
                {filteredDisetujui.map((pengajuan) => (
                  <PengajuanJudulCard key={pengajuan.id} pengajuan={pengajuan} />
                ))}
              </>
            )}
          </TabsContent>

          {/* Perlu Revisi */}
          <TabsContent value="revisi" className="space-y-4 mt-6">
            {filteredRevisi.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-4">
                      <FileEdit className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-300" />
                    </div>
                    <p className="text-base sm:text-lg font-medium text-muted-foreground">
                      {searchQuery
                        ? "Tidak ada pengajuan yang sesuai pencarian"
                        : "Tidak ada judul yang perlu revisi"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  Menampilkan {filteredRevisi.length} pengajuan
                </div>
                {filteredRevisi.map((pengajuan) => (
                  <PengajuanJudulCard key={pengajuan.id} pengajuan={pengajuan} />
                ))}
              </>
            )}
          </TabsContent>

          {/* Ditolak */}
          <TabsContent value="ditolak" className="space-y-4 mt-6">
            {filteredDitolak.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-300" />
                    </div>
                    <p className="text-base sm:text-lg font-medium text-muted-foreground">
                      {searchQuery
                        ? "Tidak ada pengajuan yang sesuai pencarian"
                        : "Tidak ada judul yang ditolak"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  Menampilkan {filteredDitolak.length} pengajuan
                </div>
                {filteredDitolak.map((pengajuan) => (
                  <PengajuanJudulCard key={pengajuan.id} pengajuan={pengajuan} />
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default VerifikasiJudulDosenPage;
