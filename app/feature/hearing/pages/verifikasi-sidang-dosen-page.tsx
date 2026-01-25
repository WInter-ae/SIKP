import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Info, Filter, Clock, CheckCircle, XCircle, Download, Eye } from "lucide-react";
import type { PengajuanSidang } from "../types/dosen";
import type { DosenESignature } from "../types/esignature";
import { PengajuanCard } from "../components/pengajuan-card";
import { ESignatureSetupDialog } from "../components/esignature-setup";

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
  const navigate = useNavigate();
  const [pengajuanList, setPengajuanList] = useState<PengajuanSidang[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("menunggu");
  const [dosenESignature, setDosenESignature] = useState<DosenESignature | null>(null);
  const [showESignatureDialog, setShowESignatureDialog] = useState(false);
  const [pendingApprovalId, setPendingApprovalId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load data pengajuan dan e-signature
  useEffect(() => {
    // Simulasi load data dari API
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Load pengajuan dari localStorage (dari mahasiswa)
      if (typeof window !== "undefined") {
        const savedPengajuan = localStorage.getItem("pengajuan-sidang-list");
        console.log("📥 DOSEN: Loading pengajuan list from localStorage");
        
        if (savedPengajuan) {
          try {
            const pengajuanFromStorage = JSON.parse(savedPengajuan);
            console.log("📋 DOSEN: Found", pengajuanFromStorage.length, "pengajuan(s)");
            console.log("📋 DOSEN: Pengajuan IDs:", pengajuanFromStorage.map((p: any) => p.id));
            setPengajuanList(pengajuanFromStorage);
          } catch (error) {
            console.error("❌ DOSEN: Error parsing pengajuan list:", error);
            setPengajuanList(mockPengajuanList);
          }
        } else {
          console.log("⚠️ DOSEN: No pengajuan in localStorage, using mock data");
          setPengajuanList(mockPengajuanList);
        }
        
        // Load e-signature dari localStorage
        const savedSignature = localStorage.getItem("dosen-esignature");
        if (savedSignature) {
          setDosenESignature(JSON.parse(savedSignature));
        }
      } else {
        setPengajuanList(mockPengajuanList);
      }
      
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
    console.log("🔵 DOSEN: handleVerifikasi called", { id, status, hasSig: !!dosenESignature });
    
    // Jika approval, cek e-signature dulu
    if (status === "approved") {
      if (!dosenESignature) {
        setPendingApprovalId(id);
        setShowESignatureDialog(true);
        setNotification({
          title: "⚠️ E-Signature Belum Dibuat",
          description: "Anda perlu membuat e-signature terlebih dahulu untuk menyetujui pengajuan.",
          variant: "destructive",
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }

      // Proses approval dengan e-signature
      processApprovalWithSignature(id, catatan, nilai);
    } else {
      // Proses rejection tanpa e-signature
      processRejection(id, catatan);
    }
  };

  const processApprovalWithSignature = (
    id: string,
    catatan: string,
    nilai?: number,
  ) => {
    console.log("🟢 DOSEN: processApprovalWithSignature started", { id, catatan, nilai });
    
    console.log("🔍 DOSEN: Finding pengajuan with id:", id);
    const pengajuan = pengajuanList.find((p) => p.id === id);
    
    if (!pengajuan) {
      console.error("❌ DOSEN: Pengajuan not found!");
      return;
    }
    
    console.log("✅ DOSEN: Jadwal sidang approved for:", pengajuan.mahasiswa.nama);
    
    // Update status pengajuan jadwal sidang (BUKAN berita acara)
    const updatedList = pengajuanList.map((p) =>
      p.id === id
        ? {
            ...p,
            status: "approved" as const,
            tanggalVerifikasi: new Date().toISOString(),
            catatanDosen: catatan,
          }
        : p,
    );
    
    setPengajuanList(updatedList);
    
    // Update status pengajuan di localStorage untuk mahasiswa
    // HANYA update status jadwal, BELUM buat berita acara
    const jadwalApproved = {
      id: pengajuan.id,
      judulLaporan: pengajuan.data.judulLaporan,
      tempatPelaksanaan: pengajuan.data.tempatPelaksanaan,
      tanggalSidang: pengajuan.data.tanggalSidang,
      waktuMulai: pengajuan.data.waktuMulai,
      waktuSelesai: pengajuan.data.waktuSelesai,
      dosenPenguji: pengajuan.data.dosenPenguji || [],
      status: "jadwal_approved", // Status baru: jadwal disetujui, belum sidang
      catatanDosen: catatan,
      createdAt: pengajuan.tanggalPengajuan,
      updatedAt: new Date().toISOString(),
      tanggalApproval: new Date().toISOString(),
    };
    
    console.log("💾 DOSEN: Saving jadwal approval to localStorage");
    console.log("📋 DOSEN: Jadwal Data:", {
      id: jadwalApproved.id,
      status: jadwalApproved.status,
      tanggalSidang: jadwalApproved.tanggalSidang
    });
    
    // Simpan ke localStorage mahasiswa (di production akan lewat API ke database)
    const jsonString = JSON.stringify(jadwalApproved);
    localStorage.setItem("berita-acara-draft", jsonString);
    
    // Update list pengajuan juga
    localStorage.setItem("pengajuan-sidang-list", JSON.stringify(updatedList));
    
    // Verify save
    const verified = localStorage.getItem("berita-acara-draft");
    console.log("✔️ DOSEN: Verified localStorage save:", verified === jsonString);
    
    // Trigger storage event manually untuk same-tab update
    console.log("📢 DOSEN: Dispatching storage event...");
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'berita-acara-draft',
      newValue: jsonString,
      storageArea: localStorage,
      url: window.location.href
    }));
    
    console.log("✅ DOSEN: Jadwal sidang approved and event dispatched successfully!");

    // Show success notification
    setNotification({
      title: "✅ Jadwal Sidang Disetujui",
      description: `Jadwal sidang telah disetujui. Mahasiswa akan menerima notifikasi.`,
    });

    setTimeout(() => setNotification(null), 4000);
  };

  const processRejection = (id: string, catatan: string) => {
    console.log("🔴 DOSEN: processRejection started", { id, catatan });
    
    console.log("🔍 DOSEN: Finding pengajuan with id:", id);
    const pengajuan = pengajuanList.find((p) => p.id === id);
    
    if (!pengajuan) {
      console.error("❌ DOSEN: Pengajuan not found!");
      return;
    }
    
    console.log("❌ DOSEN: Jadwal sidang rejected for:", pengajuan.mahasiswa.nama);
    
    const updatedList = pengajuanList.map((p) =>
      p.id === id
        ? {
            ...p,
            status: "rejected" as const,
            tanggalVerifikasi: new Date().toISOString(),
            catatanDosen: catatan,
          }
        : p,
    );
    
    setPengajuanList(updatedList);
    
    const jadwalRejected = {
      id: pengajuan.id,
      judulLaporan: pengajuan.data.judulLaporan,
      tempatPelaksanaan: pengajuan.data.tempatPelaksanaan,
      tanggalSidang: pengajuan.data.tanggalSidang,
      waktuMulai: pengajuan.data.waktuMulai,
      waktuSelesai: pengajuan.data.waktuSelesai,
      dosenPenguji: pengajuan.data.dosenPenguji || [],
      status: "rejected",
      catatanDosen: catatan,
      createdAt: pengajuan.tanggalPengajuan,
      updatedAt: new Date().toISOString(),
      tanggalVerifikasi: new Date().toISOString(),
    };
    
    console.log("💾 DOSEN: Saving rejection to localStorage");
    console.log("📋 DOSEN: Rejection Data:", {
      id: jadwalRejected.id,
      status: jadwalRejected.status,
      catatan: jadwalRejected.catatanDosen
    });
    
    const jsonString = JSON.stringify(jadwalRejected);
    localStorage.setItem("berita-acara-draft", jsonString);
    localStorage.setItem("pengajuan-sidang-list", JSON.stringify(updatedList));
    
    // Verify save
    const verified = localStorage.getItem("berita-acara-draft");
    console.log("✔️ DOSEN: Verified localStorage save:", verified === jsonString);
    
    // Trigger storage event
    console.log("📢 DOSEN: Dispatching storage event for rejection...");
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'berita-acara-draft',
      newValue: jsonString,
      storageArea: localStorage,
      url: window.location.href
    }));
    
    console.log("✅ DOSEN: Rejection saved and event dispatched!");

    setNotification({
      title: "❌ Pengajuan Ditolak",
      description: `Pengajuan sidang ditolak. Mahasiswa diminta untuk melakukan perbaikan.`,
    });

    setTimeout(() => setNotification(null), 4000);
  };

  // Handler untuk save e-signature
  const handleESignatureSave = (signature: DosenESignature) => {
    console.log("✍️ DOSEN: E-Signature saved", signature);
    setDosenESignature(signature);
    localStorage.setItem("dosen-esignature", JSON.stringify(signature));
    setShowESignatureDialog(false);
    
    // Jika ada pending approval, proses sekarang
    if (pendingApprovalId) {
      console.log("🔄 DOSEN: Processing pending approval with new signature:", pendingApprovalId);
      processApprovalWithSignature(pendingApprovalId, "Jadwal sidang disetujui");
      setPendingApprovalId(null);
    }
    
    setNotification({
      title: "✅ E-Signature Berhasil Dibuat",
      description: "Tanda tangan digital Anda telah tersimpan.",
    });
    setTimeout(() => setNotification(null), 3000);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Verifikasi Acara Sidang
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola dan verifikasi pengajuan sidang dari mahasiswa
            </p>
          </div>
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
                    className="shadow-md border-2 border-green-300 bg-green-50/30 dark:bg-green-950/10"
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Disetujui
                              </Badge>
                              <span className="text-sm font-medium">
                                {pengajuan.mahasiswa.nama}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({pengajuan.mahasiswa.nim})
                              </span>
                            </div>
                            <p className="font-semibold mb-2">
                              {pengajuan.data.judulLaporan}
                            </p>
                            
                            {/* Tanggal dan Jam Verifikasi */}
                            {pengajuan.tanggalVerifikasi && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/60 p-2 rounded border border-green-200">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Disetujui pada:</span>
                                <span>
                                  {new Date(pengajuan.tanggalVerifikasi).toLocaleString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            )}
                            
                            <div className="mt-3 space-y-2">
                              {pengajuan.nilaiAkhir && (
                                <p className="text-sm text-muted-foreground">
                                  Nilai:{" "}
                                  <span className="font-bold text-green-700">
                                    {pengajuan.nilaiAkhir}
                                  </span>
                                </p>
                              )}
                              {pengajuan.catatanDosen && (
                                <p className="text-sm text-muted-foreground">
                                  Catatan: {pengajuan.catatanDosen}
                                </p>
                              )}
                              
                              {/* Tombol Download/Lihat Berita Acara */}
                              <div className="flex gap-2 mt-4 pt-3 border-t">
                                <Button
                                  onClick={() => {
                                    // Load berita acara dari localStorage
                                    const savedDraft = localStorage.getItem("berita-acara-draft");
                                    if (savedDraft) {
                                      const beritaAcara = JSON.parse(savedDraft);
                                      if (beritaAcara.status === "approved" && beritaAcara.id === pengajuan.id) {
                                        // Generate and download PDF
                                        import("~/feature/hearing/utils/berita-acara-template").then(({ downloadBeritaAcaraHTML }) => {
                                          downloadBeritaAcaraHTML(
                                            beritaAcara,
                                            {
                                              nama: pengajuan.mahasiswa.nama,
                                              nim: pengajuan.mahasiswa.nim,
                                              programStudi: pengajuan.mahasiswa.prodi,
                                            }
                                          );
                                        });
                                      }
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download PDF
                                </Button>
                                <Button
                                  onClick={() => {
                                    // Navigate to preview berita acara
                                    window.open(`/dosen/kp/berita-acara/${pengajuan.id}`, '_blank');
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Lihat Detail
                                </Button>
                              </div>
                            </div>
                          </div>
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
                    className="shadow-md border-2 border-red-300 bg-red-50/30 dark:bg-red-950/10"
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Ditolak
                              </Badge>
                              <span className="text-sm font-medium">
                                {pengajuan.mahasiswa.nama}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ({pengajuan.mahasiswa.nim})
                              </span>
                            </div>
                            <p className="font-semibold mb-2">
                              {pengajuan.data.judulLaporan}
                            </p>
                            
                            {/* Tanggal dan Jam Verifikasi */}
                            {pengajuan.tanggalVerifikasi && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/60 p-2 rounded border border-red-200">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Ditolak pada:</span>
                                <span>
                                  {new Date(pengajuan.tanggalVerifikasi).toLocaleString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            )}
                            
                            <div className="mt-3">
                              {pengajuan.catatanDosen && (
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Alasan:</span> {pengajuan.catatanDosen}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* E-Signature Setup Dialog */}
        <ESignatureSetupDialog
          open={showESignatureDialog}
          onOpenChange={setShowESignatureDialog}
          onSave={handleESignatureSave}
          existingSignature={dosenESignature}
        />
      </div>
    </div>
  );
}
