import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Info, Filter } from "lucide-react";
import type { PengajuanSidang } from "../types/dosen";
import { PengajuanCard } from "../components/pengajuan-card";

// Mock data pengajuan dari mahasiswa
const mockPengajuanList: PengajuanSidang[] = [
  {
    id: "PGJ-001",
    mahasiswa: {
      id: "MHS-001",
      nama: "Budi Santoso",
      nim: "12345001",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan: "Sistem Informasi Manajemen Perpustakaan Berbasis Web",
      tempatPelaksanaan: "Ruang Seminar A, Gedung FMIPA",
      tanggalSidang: "2025-12-01",
      waktuMulai: "09:00",
      waktuSelesai: "11:00",
    },
    status: "submitted",
    tanggalPengajuan: "2025-11-24T08:30:00",
  },
  {
    id: "PGJ-002",
    mahasiswa: {
      id: "MHS-002",
      nama: "Siti Rahayu",
      nim: "12345002",
      prodi: "Sistem Informasi",
    },
    data: {
      judulLaporan: "Aplikasi Mobile E-Commerce dengan Fitur Augmented Reality",
      tempatPelaksanaan: "Ruang Sidang B, Gedung FMIPA",
      tanggalSidang: "2025-12-02",
      waktuMulai: "13:00",
      waktuSelesai: "15:00",
    },
    status: "submitted",
    tanggalPengajuan: "2025-11-24T10:15:00",
  },
  {
    id: "PGJ-003",
    mahasiswa: {
      id: "MHS-003",
      nama: "Ahmad Fauzi",
      nim: "12345003",
      prodi: "Teknik Informatika",
    },
    data: {
      judulLaporan: "Implementasi Machine Learning untuk Prediksi Cuaca",
      tempatPelaksanaan: "Ruang Lab Komputer 3",
      tanggalSidang: "2025-12-03",
      waktuMulai: "08:00",
      waktuSelesai: "10:00",
    },
    status: "submitted",
    tanggalPengajuan: "2025-11-24T14:20:00",
  },
];

export default function VerifikasiSidangDosenPage() {
  const [pengajuanList, setPengajuanList] = useState<PengajuanSidang[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menunggu");
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load data pengajuan
  useEffect(() => {
    // Simulasi load data dari API
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPengajuanList(mockPengajuanList);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleVerifikasi = (
    id: string,
    status: "approved" | "rejected",
    catatan: string,
    nilai?: number,
  ) => {
    // Update status pengajuan
    setPengajuanList((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              tanggalVerifikasi: new Date().toISOString(),
              catatanDosen: catatan,
              nilaiAkhir: nilai,
            }
          : p,
      ),
    );

    // Show notification
    setNotification({
      title:
        status === "approved"
          ? "✅ Pengajuan Disetujui"
          : "❌ Pengajuan Ditolak",
      description:
        status === "approved"
          ? `Pengajuan sidang telah disetujui. Mahasiswa akan menerima notifikasi.`
          : `Pengajuan sidang ditolak. Mahasiswa diminta untuk melakukan perbaikan.`,
    });

    // Auto hide notification after 4 seconds
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter pengajuan berdasarkan status
  const pengajuanMenunggu = pengajuanList.filter(
    (p) => p.status === "submitted",
  );
  const pengajuanDisetujui = pengajuanList.filter(
    (p) => p.status === "approved",
  );
  const pengajuanDitolak = pengajuanList.filter(
    (p) => p.status === "rejected",
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground text-lg">
                Memuat data pengajuan...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            Verifikasi Acara Sidang
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola dan verifikasi pengajuan sidang dari mahasiswa
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <Alert variant={notification.variant} className="shadow-md">
            <Info className="h-5 w-5" />
            <AlertDescription>
              <div>
                <p className="font-semibold">{notification.title}</p>
                <p className="text-sm">{notification.description}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs untuk filter status */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-card shadow-md">
            <TabsTrigger value="menunggu" className="gap-2 font-semibold">
              Menunggu
              {pengajuanMenunggu.length > 0 && (
                <Badge
                  variant="destructive"
                  className="rounded-full px-2 py-0 text-xs"
                >
                  {pengajuanMenunggu.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="disetujui" className="gap-2 font-semibold">
              Disetujui
              {pengajuanDisetujui.length > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-xs"
                >
                  {pengajuanDisetujui.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ditolak" className="gap-2 font-semibold">
              Ditolak
              {pengajuanDitolak.length > 0 && (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0 text-xs"
                >
                  {pengajuanDitolak.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Menunggu Verifikasi */}
          <TabsContent value="menunggu" className="mt-6 space-y-4">
            {pengajuanMenunggu.length === 0 ? (
              <Card className="shadow-md">
                <CardContent className="py-12">
                  <div className="text-center space-y-3">
                    <Filter className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground font-medium">
                      Tidak ada pengajuan yang menunggu verifikasi
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Semua pengajuan telah diverifikasi
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pengajuanMenunggu.map((pengajuan) => (
                  <PengajuanCard
                    key={pengajuan.id}
                    pengajuan={pengajuan}
                    onVerifikasi={handleVerifikasi}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Disetujui */}
          <TabsContent value="disetujui" className="mt-6 space-y-4">
            {pengajuanDisetujui.length === 0 ? (
              <Card className="shadow-md">
                <CardContent className="py-12">
                  <div className="text-center space-y-3">
                    <Info className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground font-medium">
                      Belum ada pengajuan yang disetujui
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pengajuanDisetujui.map((pengajuan) => (
                  <Card
                    key={pengajuan.id}
                    className="shadow-md border-2 border-primary/30"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge>Disetujui</Badge>
                            <span className="text-sm text-muted-foreground">
                              {pengajuan.mahasiswa.nama} (
                              {pengajuan.mahasiswa.nim})
                            </span>
                          </div>
                          <p className="font-semibold mb-2">
                            {pengajuan.data.judulLaporan}
                          </p>
                          {pengajuan.nilaiAkhir && (
                            <p className="text-sm text-muted-foreground">
                              Nilai:{" "}
                              <span className="font-bold text-primary">
                                {pengajuan.nilaiAkhir}
                              </span>
                            </p>
                          )}
                          {pengajuan.catatanDosen && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Catatan: {pengajuan.catatanDosen}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Ditolak */}
          <TabsContent value="ditolak" className="mt-6 space-y-4">
            {pengajuanDitolak.length === 0 ? (
              <Card className="shadow-md">
                <CardContent className="py-12">
                  <div className="text-center space-y-3">
                    <Info className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground font-medium">
                      Tidak ada pengajuan yang ditolak
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pengajuanDitolak.map((pengajuan) => (
                  <Card
                    key={pengajuan.id}
                    className="shadow-md border-2 border-destructive/30"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive">Ditolak</Badge>
                            <span className="text-sm text-muted-foreground">
                              {pengajuan.mahasiswa.nama} (
                              {pengajuan.mahasiswa.nim})
                            </span>
                          </div>
                          <p className="font-semibold mb-2">
                            {pengajuan.data.judulLaporan}
                          </p>
                          {pengajuan.catatanDosen && (
                            <p className="text-sm text-muted-foreground">
                              Alasan: {pengajuan.catatanDosen}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
