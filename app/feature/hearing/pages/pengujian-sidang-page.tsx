import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BeritaAcaraForm } from "../components/berita-acara-form";
import { BeritaAcaraStatus } from "../components/berita-acara-status";
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
import { ArrowLeft, Info } from "lucide-react";
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
];

export default function PengujianSidangPage() {
  const navigate = useNavigate();
  
  // State untuk berita acara
  const [beritaAcara, setBeritaAcara] = useState<BeritaAcara | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [notification, setNotification] = useState<{
    title: string;
    description: string;
    variant?: "default" | "destructive";
  } | null>(null);

  // Load draft dari localStorage hanya di client-side
  useEffect(() => {
    // Cek apakah ada draft tersimpan di localStorage
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem("berita-acara-draft");
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setBeritaAcara(parsed);
          setShowForm(
            !parsed || 
            parsed.status === "draft" || 
            parsed.status === "rejected"
          );
        } catch (error) {
          console.error("Error parsing saved draft:", error);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Update showForm ketika beritaAcara berubah
  useEffect(() => {
    if (beritaAcara) {
      setShowForm(
        beritaAcara.status === "draft" || 
        beritaAcara.status === "rejected"
      );
    }
  }, [beritaAcara]);

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
        id: beritaAcara?.id || `BA-${Date.now()}`,
        ...data,
        status: "submitted",
        createdAt: beritaAcara?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as BeritaAcara;

      setBeritaAcara(submitted);
      setShowForm(false);
      
      // Hapus draft dari localStorage hanya di client-side
      if (typeof window !== "undefined") {
        localStorage.removeItem("berita-acara-draft");
      }

      setNotification({
        title: "✅ Berhasil diajukan",
        description: "Berita acara telah diajukan ke dosen pembimbing.",
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
    const nomorSurat = `BA/KP/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(4, "0")}`;
    
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

  // Simulasi perubahan status untuk testing (akan dihapus di production)
  const simulateStatusChange = (newStatus: BeritaAcara["status"]) => {
    if (!beritaAcara) return;

    const updated: BeritaAcara = {
      ...beritaAcara,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === "approved" && {
        nilaiAkhir: 85,
        catatanDosen: "Presentasi baik, laporan lengkap dan terstruktur. Pertahankan!",
      }),
      ...(newStatus === "rejected" && {
        catatanDosen: "Beberapa data masih kurang lengkap. Mohon dilengkapi terlebih dahulu.",
      }),
    };

    setBeritaAcara(updated);
    setShowForm(newStatus === "rejected");
  };

  // Tampilkan loading state saat sedang load data dari localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-700 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">Memuat data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pengujian Sidang Kerja Praktik
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Ajukan berita acara sidang dan dapatkan surat setelah disetujui dosen
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

        {/* Testing Controls (hanya untuk development) */}
        {beritaAcara && process.env.NODE_ENV === "development" && (
          <Alert className="border-dashed border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950 shadow-md">
            <Info className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  🧪 Kontrol Pengujian (Hanya untuk Development)
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateStatusChange("submitted")}
                    className="h-8"
                  >
                    Ubah ke Diajukan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateStatusChange("approved")}
                    className="h-8"
                  >
                    Ubah ke Disetujui
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => simulateStatusChange("rejected")}
                    className="h-8"
                  >
                    Ubah ke Ditolak
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowResetDialog(true)}
                    className="h-8"
                  >
                    Reset Data
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Form atau Status */}
        <div className="space-y-6">
          {showForm ? (
            <BeritaAcaraForm
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              initialData={beritaAcara || undefined}
              isSubmitting={isSubmitting}
            />
          ) : null}

          {beritaAcara && !showForm && (
            <BeritaAcaraStatus
              beritaAcara={beritaAcara}
              dosenPenguji={mockDosenPenguji}
              onGenerateSurat={handleGenerateSurat}
              onEdit={beritaAcara.status === "rejected" ? handleEdit : undefined}
            />
          )}

          {!beritaAcara && !showForm && (
            <Alert className="shadow-md">
              <Info className="h-5 w-5" />
              <AlertDescription>
                <div className="space-y-4">
                  <p className="font-medium">Belum ada berita acara yang dibuat</p>
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

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Data Berita Acara?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus semua data berita acara dan draft yang tersimpan.
                Data yang sudah dihapus tidak dapat dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setBeritaAcara(null);
                  setShowForm(true);
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("berita-acara-draft");
                  }
                  setNotification({
                    title: "Data berhasil direset",
                    description: "Semua data berita acara telah dihapus.",
                  });
                  setTimeout(() => setNotification(null), 3000);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Ya, Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
