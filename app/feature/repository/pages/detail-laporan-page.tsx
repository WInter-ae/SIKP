import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  Building2,
  User,
  FileText,
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import type { LaporanKP } from "../types";

// Data dummy - sesuaikan dengan data dari repository-page
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
      "Penelitian ini membahas tentang implementasi sistem informasi manajemen inventori berbasis web yang bertujuan untuk meningkatkan efisiensi pengelolaan stok barang di PT. Teknologi Maju. Sistem dikembangkan menggunakan framework Laravel dan database MySQL dengan fitur-fitur seperti pencatatan stok masuk/keluar, laporan inventori real-time, notifikasi stok minimum, dan dashboard analitik. Hasil implementasi menunjukkan peningkatan efisiensi sebesar 40% dalam proses pengelolaan inventori.",
    fileUrl: "/files/laporan-1.pdf",
    thumbnailUrl: "https://picsum.photos/seed/1/400/300",
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
    thumbnailUrl: "https://picsum.photos/seed/2/400/300",
    downloadCount: 32,
    viewCount: 89,
    tags: ["React Native", "E-Commerce", "Mobile"],
  },
  // ... data lainnya bisa ditambahkan
];

export default function DetailLaporanPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Cari laporan berdasarkan ID
  const laporan = DUMMY_LAPORAN.find((l) => l.id === id);

  if (!laporan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Laporan Tidak Ditemukan
            </h2>
            <p className="text-gray-600 mb-4">
              Laporan KP yang Anda cari tidak tersedia.
            </p>
            <Button onClick={() => navigate("/mahasiswa/repositori")}>
              Kembali ke Repositori
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-700";
      case "review":
        return "bg-yellow-200 text-yellow-800";
      case "approved":
        return "bg-blue-200 text-blue-800";
      case "published":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const handleDownload = () => {
    // Implementasi download file
    if (laporan.fileUrl) {
      window.open(laporan.fileUrl, "_blank");
    }
  };

  const handleShare = () => {
    // Implementasi share
    if (navigator.share) {
      navigator.share({
        title: laporan.judul,
        text: laporan.abstrak,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/mahasiswa/repositori")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Repositori
        </Button>

        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Badge
                  className={`mb-3 ${getStatusBadgeColor(laporan.status)}`}
                >
                  {laporan.status}
                </Badge>
                <CardTitle className="text-3xl mb-4">{laporan.judul}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {laporan.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {laporan.thumbnailUrl && (
                <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={laporan.thumbnailUrl}
                    alt={laporan.judul}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{laporan.viewCount} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{laporan.downloadCount} downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(laporan.tanggalUpload).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {laporan.fileUrl && (
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Laporan
                </Button>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Bagikan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Abstrak */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Abstrak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-justify">
                  {laporan.abstrak}
                </p>
              </CardContent>
            </Card>

            {/* Informasi Tambahan */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Tahun & Periode
                  </h4>
                  <p className="text-gray-900">
                    {laporan.tahun} - Semester {laporan.periode}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Kategori
                  </h4>
                  <p className="text-gray-900">{laporan.kategori}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Tanggal Upload
                  </h4>
                  <p className="text-gray-900">
                    {new Date(laporan.tanggalUpload).toLocaleDateString(
                      "id-ID",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>

                {laporan.tanggalPublish && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Tanggal Publish
                      </h4>
                      <p className="text-gray-900">
                        {new Date(laporan.tanggalPublish).toLocaleDateString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Mahasiswa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mahasiswa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={laporan.mahasiswa.foto}
                      alt={laporan.mahasiswa.nama}
                    />
                    <AvatarFallback>
                      {laporan.mahasiswa.nama
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {laporan.mahasiswa.nama}
                    </p>
                    <p className="text-sm text-gray-600">
                      {laporan.mahasiswa.nim}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Perusahaan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Perusahaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium">
                  {laporan.perusahaan}
                </p>
              </CardContent>
            </Card>

            {/* Pembimbing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dosen Pembimbing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium">
                  {laporan.pembimbing.nama}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  NIDN: {laporan.pembimbing.nidn}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
