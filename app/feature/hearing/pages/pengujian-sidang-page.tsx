/**
 * Pengujian Sidang Kerja Praktik Page
 * 
 * Alur Sistem:
 * 1. Mahasiswa mengisi form berita acara dengan data:
 *    - Judul Laporan
 *    - Tempat Pelaksanaan
 *    - Tanggal dan Waktu Sidang
 *    - Data Dosen Penguji (Pembimbing + Penguji tambahan opsional)
 * 
 * 2. Setelah submit, data dikirim ke dosen pembimbing yang dituju
 *    - Data dikirim berdasarkan NIP dosen yang diinput
 *    - Status: "submitted" - menunggu verifikasi
 * 
 * 3. Dosen melakukan verifikasi:
 *    a. DISETUJUI (approved):
 *       - Dosen menandatangani dengan e-signature
 *       - Mahasiswa dapat mengunduh PDF Berita Acara
 *       - Status: "approved"
 *    
 *    b. DITOLAK (rejected):
 *       - Dosen memberikan catatan/pesan penolakan
 *       - Mahasiswa melihat alasan penolakan
 *       - Mahasiswa dapat mengedit dan mengajukan ulang
 *       - Status: "rejected"
 * 
 * 4. Download PDF (hanya jika approved):
 *    - Dokumen dengan e-signature dosen
 *    - Format: PDF dan DOCX
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BeritaAcaraForm } from "../components/berita-acara-form";
import { BeritaAcaraStatus } from "../components/berita-acara-status";
import { BeritaAcaraDownload } from "../components/berita-acara-download";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Info, FileText, Clock, Edit, Trash2, RefreshCw, CheckCircle2 } from "lucide-react";
import type { BeritaAcara, DosenPenguji } from "../types";

// Mock data - nanti akan diganti dengan data dari API/backend
const mockDosenPenguji: DosenPenguji[] = [
  {
    id: 1,
    nama: "Dr. Ahmad Santoso, M.Kom",
    nip: "198501012010121001",
    jabatan: "pembimbing",
  },
  {
    id: 2,
    nama: "Dr. Budi Pratama, M.T",
    nip: "198705152012101001",
    jabatan: "penguji",
  },
  {
    id: 3,
    nama: "Dr. Citra Dewi, M.Kom",
    nip: "198805202015041002",
    jabatan: "penguji",
  },
];

// Mock data mahasiswa - akan diganti dengan data dari session/auth
const mockMahasiswa = {
  nama: "Budi Santoso",
  nim: "12345001",
  programStudi: "Teknik Informatika",
};

export default function PengujianSidangPage() {
  const navigate = useNavigate();
  
  console.log("🚀 PengujianSidangPage Component Mounted");
  
  // State untuk berita acara
  const [beritaAcara, setBeritaAcara] = useState<BeritaAcara | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDraftDialog, setShowDeleteDraftDialog] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [approvalNotificationShown, setApprovalNotificationShown] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load draft dari localStorage hanya di client-side
  useEffect(() => {
    // Cek apakah ada draft tersimpan di localStorage
    if (typeof window !== "undefined") {
      const loadBeritaAcara = () => {
        const savedDraft = localStorage.getItem("berita-acara-draft");
        console.log("🔄 MAHASISWA: Checking localStorage for updates...", savedDraft ? "Data found" : "No data");
        setLastChecked(new Date());
        
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            console.log("📄 MAHASISWA: Berita Acara Data:", {
              status: parsed.status,
              hasSignature: !!parsed.dosenSignature,
              signedAt: parsed.dosenSignature?.signedAt,
              updatedAt: parsed.updatedAt
            });
            
            // Update state dengan data terbaru
            setBeritaAcara((prev) => {
              // Cek apakah ada perubahan status
              if (prev?.status !== parsed.status) {
                console.log(`✨ MAHASISWA: Status changed: ${prev?.status} → ${parsed.status}`);
              }
              return parsed;
            });
            
            // Jangan auto-update form visibility di sini, biarkan user yang control
          } catch (error) {
            console.error("Error parsing saved draft:", error);
          }
        }
        setIsLoading(false);
      };

      // Load pertama kali
      loadBeritaAcara();

      // Polling setiap 2 detik untuk cek update dari dosen (lebih cepat)
      const intervalId = setInterval(() => {
        loadBeritaAcara();
      }, 2000);

      // Listen untuk storage event (perubahan localStorage dari tab/window lain)
      const handleStorageChange = (e: StorageEvent) => {
        console.log("🔔 MAHASISWA: Storage event detected:", e.key);
        if (e.key === "berita-acara-draft" && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            console.log("📥 MAHASISWA: Storage update received:", {
              status: parsed.status,
              hasSignature: !!parsed.dosenSignature
            });
            setBeritaAcara(parsed);
          } catch (error) {
            console.error("Error parsing storage event:", error);
          }
        }
      };

      window.addEventListener("storage", handleStorageChange);

      // Cleanup interval dan event listener saat component unmount
      return () => {
        clearInterval(intervalId);
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  // Update notification ketika beritaAcara berubah
  useEffect(() => {
    if (beritaAcara) {
      // Tampilkan notifikasi hanya sekali saat status berubah menjadi approved
      if (beritaAcara.status === "approved" && beritaAcara.dosenSignature && !approvalNotificationShown) {
        setApprovalNotificationShown(true);
        setShowForm(false); // Tutup form jika approved
        setNotification({
          title: "✅ Berita Acara Disetujui!",
          description: "Berita acara Anda telah disetujui oleh dosen. Silakan unduh dokumen.",
        });
        setTimeout(() => setNotification(null), 5000);
      }
      
      // Reset flag jika status kembali ke submitted/draft/rejected
      if (beritaAcara.status !== "approved" && approvalNotificationShown) {
        setApprovalNotificationShown(false);
      }
    }
  }, [beritaAcara, approvalNotificationShown]);

  // Handler untuk simpan draft
  const handleSaveDraft = (data: Partial<BeritaAcara>) => {
    const draft: BeritaAcara = {
      ...data,
      status: "draft",
      createdAt: beritaAcara?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as BeritaAcara;

    setBeritaAcara(draft);

    // Simpan ke localStorage hanya di client-side
    if (typeof window !== "undefined") {
      localStorage.setItem("berita-acara-draft", JSON.stringify(draft));
    }

    setNotification({
      title: "✅ Draft berhasil disimpan",
      description: "Data berita acara Anda telah tersimpan sebagai draft.",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handler untuk submit berita acara ke dosen
  const handleSubmit = async (data: Partial<BeritaAcara>) => {
    setIsSubmitting(true);

    try {
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const submitted: BeritaAcara = {
        id: beritaAcara?.id || `PGJ-${Date.now()}`,
        ...data,
        status: "submitted",
        createdAt: beritaAcara?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as BeritaAcara;

      setBeritaAcara(submitted);
      setShowForm(false);
      
      // Simpan berita acara mahasiswa ke localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("berita-acara-draft", JSON.stringify(submitted));
        
        console.log("📤 MAHASISWA: Sending to dosen list with ID:", submitted.id);
        
        // Kirim ke list pengajuan dosen
        const existingPengajuan = localStorage.getItem("pengajuan-sidang-list");
        let pengajuanList = existingPengajuan ? JSON.parse(existingPengajuan) : [];
        
        console.log("📋 MAHASISWA: Current pengajuan list length:", pengajuanList.length);
        
        // Cek apakah pengajuan ini sudah ada (untuk edit)
        const existingIndex = pengajuanList.findIndex((p: any) => p.id === submitted.id);
        
        const pengajuanData = {
          id: submitted.id,
          mahasiswa: {
            id: "MHS-001", // Di production dari session/auth
            nama: "Budi Santoso",
            nim: "12345001",
            prodi: "Teknik Informatika",
          },
          data: {
            judulLaporan: submitted.judulLaporan,
            tempatPelaksanaan: submitted.tempatPelaksanaan,
            tanggalSidang: submitted.tanggalSidang,
            waktuMulai: submitted.waktuMulai,
            waktuSelesai: submitted.waktuSelesai,
            dosenPenguji: submitted.dosenPenguji || [],
          },
          dosenPembimbing: submitted.dosenPenguji?.find(d => d.jabatan === "pembimbing"),
          status: "submitted",
          tanggalPengajuan: submitted.createdAt,
          tanggalUpdate: new Date().toISOString(),
        };
        
        if (existingIndex >= 0) {
          // Update pengajuan yang sudah ada (untuk edit)
          pengajuanList[existingIndex] = pengajuanData;
          console.log("🔄 MAHASISWA: Updated existing pengajuan at index:", existingIndex);
        } else {
          // Tambahkan pengajuan baru
          pengajuanList.push(pengajuanData);
          console.log("➕ MAHASISWA: Added new pengajuan, total now:", pengajuanList.length);
        }
        
        localStorage.setItem("pengajuan-sidang-list", JSON.stringify(pengajuanList));
        console.log("✅ MAHASISWA: Successfully saved to pengajuan-sidang-list");
      }

      const dosenPembimbing = submitted.dosenPenguji?.find(d => d.jabatan === "pembimbing");
      setNotification({
        title: "✅ Berhasil diajukan",
        description: `Berita acara telah diajukan dan terkirim ke ${dosenPembimbing?.nama || "dosen pembimbing"} (NIP: ${dosenPembimbing?.nip || "-"}).`,
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error submitting berita acara:", error);
      setNotification({
        variant: "destructive",
        title: "❌ Gagal mengajukan",
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler untuk generate surat
  const handleGenerateSurat = () => {
    if (!beritaAcara || beritaAcara.status !== "approved") {
      setNotification({
        variant: "destructive",
        title: "⚠️ Tidak dapat generate surat",
        description: "Berita acara harus disetujui terlebih dahulu!",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    // Simulasi generate surat
    const nomorSurat = `BA/KP/${new Date().getFullYear()}/${Math.floor(
      Math.random() * 1000,
    )
      .toString()
      .padStart(4, "0")}`;

    setNotification({
      title: "✅ Surat berhasil digenerate",
      description: `Nomor Surat: ${nomorSurat}. Surat dapat diunduh dari menu Arsip.`,
    });
    setTimeout(() => setNotification(null), 3000);

    // Di production, ini akan trigger download PDF atau redirect ke halaman preview surat
    console.log("Generate surat dengan data:", {
      nomorSurat,
      beritaAcara,
      dosenPenguji: mockDosenPenguji,
    });
  };

  // Handler untuk edit berita acara
  const handleEdit = () => {
    setShowForm(true);
  };

  // Handler untuk melanjutkan draft
  const handleContinueDraft = () => {
    setShowForm(true);
  };

  // Handler untuk hapus draft
  const handleDeleteDraft = () => {
    setShowDeleteDraftDialog(true);
  };

  const confirmDeleteDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("berita-acara-draft");
    }
    setBeritaAcara(null);
    setShowForm(false);
    setShowDeleteDraftDialog(false);
    
    setNotification({
      title: "✅ Draft berhasil dihapus",
      description: "Draft berita acara telah dihapus dari sistem.",
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Format tanggal untuk tampilan
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tampilkan loading state saat sedang load data dari localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground text-lg">Memuat data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 h-11 px-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5" />
            Kembali
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              Pengujian Sidang Kerja Praktik
            </h1>
            <p className="text-muted-foreground mt-1">
              Ajukan berita acara sidang dan dapatkan surat setelah disetujui
              dosen
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

        {/* Form atau Status */}
        <div className="space-y-6">
          {/* Draft Card - Tampilkan jika ada draft dan form tidak ditampilkan */}
          {beritaAcara && beritaAcara.status === "draft" && !showForm && (
            <Card className="shadow-md border-2 border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-yellow-600" />
                    <div>
                      <CardTitle className="text-xl">Draft Berita Acara</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Anda memiliki draft yang belum diajukan
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-yellow-600 text-yellow-700 dark:text-yellow-400">
                    Draft
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Draft */}
                <div className="bg-background rounded-lg p-4 space-y-3 border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Judul Laporan</p>
                    <p className="font-medium">{beritaAcara.judulLaporan || "-"}</p>
                  </div>
                  
                  {beritaAcara.tempatPelaksanaan && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tempat Pelaksanaan</p>
                      <p className="font-medium">{beritaAcara.tempatPelaksanaan}</p>
                    </div>
                  )}
                  
                  {beritaAcara.tanggalSidang && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Tanggal</p>
                        <p className="font-medium">
                          {new Date(beritaAcara.tanggalSidang).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Waktu Mulai</p>
                        <p className="font-medium">{beritaAcara.waktuMulai || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Waktu Selesai</p>
                        <p className="font-medium">{beritaAcara.waktuSelesai || "-"}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Clock className="h-4 w-4" />
                    <span>Terakhir disimpan: {beritaAcara.updatedAt ? formatDateTime(beritaAcara.updatedAt) : "-"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleContinueDraft}
                    className="flex-1 h-11 font-semibold gap-2"
                  >
                    <Edit className="h-5 w-5" />
                    Lanjutkan Mengisi
                  </Button>
                  <Button
                    onClick={handleDeleteDraft}
                    variant="outline"
                    className="sm:w-auto h-11 font-semibold gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                    Hapus Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejected Card - Tampilkan jika ditolak oleh dosen */}
          {beritaAcara && beritaAcara.status === "rejected" && !showForm && (
            <>
              <BeritaAcaraDownload 
                beritaAcara={beritaAcara}
                mahasiswa={mockMahasiswa}
              />
              
              {/* Action Button untuk ajukan ulang */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleEdit}
                    className="w-full h-14 font-semibold gap-2 bg-red-600 hover:bg-red-700 text-base"
                  >
                    <Edit className="h-5 w-5" />
                    Ajukan Ulang / Perbaiki Pengajuan
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Submitted Card - Tampilkan jika sudah submitted dan menunggu approval jadwal */}
          {beritaAcara && beritaAcara.status === "submitted" && !showForm && (
            <Card className="shadow-md border-2 border-blue-400 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-xl">Jadwal Sidang Telah Diajukan</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Menunggu persetujuan jadwal dari dosen pembimbing
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-blue-600 text-blue-700 dark:text-blue-400">
                    Menunggu Verifikasi
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Jadwal Sidang */}
                <div className="bg-background rounded-lg p-4 space-y-3 border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Judul Laporan</p>
                    <p className="font-medium">{beritaAcara.judulLaporan}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tempat Pelaksanaan</p>
                    <p className="font-medium">{beritaAcara.tempatPelaksanaan}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tanggal</p>
                      <p className="font-medium">
                        {new Date(beritaAcara.tanggalSidang).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Waktu Mulai</p>
                      <p className="font-medium">{beritaAcara.waktuMulai}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Waktu Selesai</p>
                      <p className="font-medium">{beritaAcara.waktuSelesai}</p>
                    </div>
                  </div>

                  {/* Dosen Penguji */}
                  {beritaAcara.dosenPenguji && beritaAcara.dosenPenguji.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Dosen Penguji</p>
                      <div className="space-y-2">
                        {beritaAcara.dosenPenguji.map((dosen) => (
                          <div key={dosen.id} className="text-sm bg-muted px-3 py-2 rounded-md">
                            <p className="font-medium">{dosen.nama}</p>
                            <p className="text-xs text-muted-foreground">NIP: {dosen.nip} • {dosen.jabatan === "pembimbing" ? "Pembimbing" : "Penguji"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Clock className="h-4 w-4" />
                    <span>Diajukan pada: {beritaAcara.updatedAt ? formatDateTime(beritaAcara.updatedAt) : "-"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Auto-checking... Terakhir dicek: {lastChecked.toLocaleTimeString("id-ID")}</span>
                  </div>
                </div>

                {/* Info Alert */}
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <p className="font-semibold">Pengajuan Jadwal Sidang Anda sedang diproses</p>
                    <p className="text-sm mt-1">
                      Dosen pembimbing akan meninjau jadwal sidang Anda. Status akan otomatis terupdate setiap 2 detik.
                    </p>
                    <p className="text-xs mt-2 opacity-75">
                      💡 Tip: Biarkan halaman ini terbuka untuk menerima update otomatis saat disetujui.
                    </p>
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="flex-1 h-11 font-semibold gap-2"
                  >
                    <Edit className="h-5 w-5" />
                    Edit Pengajuan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Jadwal Approved Card - Jadwal disetujui, menunggu sidang dilaksanakan */}
          {beritaAcara && beritaAcara.status === "jadwal_approved" && !showForm && (
            <BeritaAcaraDownload 
              beritaAcara={beritaAcara}
              mahasiswa={mockMahasiswa}
            />
          )}

          {/* Approved Card - Berita Acara Sudah Disetujui dan Ditandatangani */}
          {beritaAcara && beritaAcara.status === "approved" && !showForm && (
            <Card className="shadow-md border-2 border-green-500 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <CardTitle className="text-xl">Berita Acara Disetujui</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Dokumen telah ditandatangani dan siap diunduh
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Selesai
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Download Section */}
                <BeritaAcaraDownload 
                  beritaAcara={beritaAcara}
                  mahasiswa={mockMahasiswa}
                />

                {/* Success Alert */}
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <p className="font-semibold">Proses Sidang Selesai</p>
                    <p className="text-sm mt-1">
                      Berita Acara telah disetujui oleh dosen pembimbing. Anda dapat mengunduh dokumen di atas.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Disetujui pada: {beritaAcara.tanggalApproval ? formatDateTime(beritaAcara.tanggalApproval) : "-"}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form untuk input jadwal sidang */}
          {showForm && (
            <BeritaAcaraForm
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              initialData={beritaAcara || undefined}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Empty state - Belum ada jadwal */}
          {!beritaAcara && !showForm && (
            <Alert className="shadow-md">
              <Info className="h-5 w-5" />
              <AlertDescription>
                <div className="space-y-4">
                  <p className="font-medium">
                    Belum ada berita acara yang dibuat
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-green-700 hover:bg-green-800 h-11"
                  >
                    Buat Berita Acara Baru
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Delete Draft Confirmation Dialog */}
        <AlertDialog open={showDeleteDraftDialog} onOpenChange={setShowDeleteDraftDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Draft Berita Acara?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus semua data berita acara dan draft
                yang tersimpan. Data yang sudah dihapus tidak dapat
                dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteDraft}
                className="bg-red-600 hover:bg-red-700"
              >
                Ya, Hapus Draft
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
