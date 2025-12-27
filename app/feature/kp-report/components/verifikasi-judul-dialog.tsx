import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  FileEdit,
  AlertCircle,
} from "lucide-react";
import type { PengajuanJudul } from "../types/judul";

interface VerifikasiJudulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pengajuan: PengajuanJudul;
  onSubmit: (
    status: "approved" | "rejected" | "revision",
    catatan: string
  ) => void;
}

export function VerifikasiJudulDialog({
  open,
  onOpenChange,
  pengajuan,
  onSubmit,
}: VerifikasiJudulDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    "approved" | "rejected" | "revision" | null
  >(null);
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // Validasi
    if (!selectedStatus) {
      setError("Pilih status verifikasi terlebih dahulu");
      return;
    }

    if (!catatan.trim()) {
      setError("Catatan verifikasi harus diisi");
      return;
    }

    if (catatan.trim().length < 10) {
      setError("Catatan minimal 10 karakter");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSubmit(selectedStatus, catatan);

      // Reset form
      setSelectedStatus(null);
      setCatatan("");
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan verifikasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(null);
    setCatatan("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verifikasi Judul Laporan</DialogTitle>
          <DialogDescription>
            Tinjau dan berikan keputusan untuk pengajuan judul laporan dari{" "}
            <span className="font-semibold">{pengajuan.mahasiswa.nama}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Mahasiswa */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Nama</p>
                <p className="font-medium">{pengajuan.mahasiswa.nama}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NIM</p>
                <p className="font-medium">{pengajuan.mahasiswa.nim}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Program Studi</p>
                <p className="font-medium">{pengajuan.mahasiswa.prodi}</p>
              </div>
              {pengajuan.tim && (
                <div>
                  <p className="text-muted-foreground">Tim</p>
                  <p className="font-medium">{pengajuan.tim.nama}</p>
                </div>
              )}
            </div>
          </div>

          {/* Judul yang Diajukan */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Judul Laporan</Label>
            <div className="bg-background border rounded-md p-4">
              <p className="font-medium">{pengajuan.data.judulLaporan}</p>
              {pengajuan.data.judulInggris && (
                <p className="text-sm text-muted-foreground italic mt-2">
                  {pengajuan.data.judulInggris}
                </p>
              )}
            </div>
          </div>

          {/* Tempat & Periode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Tempat Magang</Label>
              <p className="text-sm mt-1">{pengajuan.data.tempatMagang}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Periode</Label>
              <p className="text-sm mt-1">
                {new Date(pengajuan.data.periode.mulai).toLocaleDateString("id-ID")} -{" "}
                {new Date(pengajuan.data.periode.selesai).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Deskripsi</Label>
            <div className="bg-background border rounded-md p-3">
              <p className="text-sm">{pengajuan.data.deskripsi}</p>
            </div>
          </div>

          {/* Pilihan Status Verifikasi */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Keputusan Verifikasi
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {/* Setuju */}
              <button
                onClick={() => setSelectedStatus("approved")}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === "approved"
                    ? "border-green-500 bg-green-50"
                    : "border-border hover:border-green-300"
                }`}
              >
                <CheckCircle
                  className={`w-5 h-5 ${
                    selectedStatus === "approved"
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left flex-1">
                  <p className="font-semibold">Setujui Judul</p>
                  <p className="text-sm text-muted-foreground">
                    Judul sudah sesuai dan dapat dilanjutkan
                  </p>
                </div>
              </button>

              {/* Revisi */}
              <button
                onClick={() => setSelectedStatus("revision")}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === "revision"
                    ? "border-blue-500 bg-blue-50"
                    : "border-border hover:border-blue-300"
                }`}
              >
                <FileEdit
                  className={`w-5 h-5 ${
                    selectedStatus === "revision"
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left flex-1">
                  <p className="font-semibold">Minta Revisi</p>
                  <p className="text-sm text-muted-foreground">
                    Judul perlu diperbaiki sesuai catatan
                  </p>
                </div>
              </button>

              {/* Tolak */}
              <button
                onClick={() => setSelectedStatus("rejected")}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === "rejected"
                    ? "border-red-500 bg-red-50"
                    : "border-border hover:border-red-300"
                }`}
              >
                <XCircle
                  className={`w-5 h-5 ${
                    selectedStatus === "rejected"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                />
                <div className="text-left flex-1">
                  <p className="font-semibold">Tolak Judul</p>
                  <p className="text-sm text-muted-foreground">
                    Judul tidak sesuai dan harus diganti
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <Label htmlFor="catatan" className="text-base font-semibold">
              Catatan Verifikasi{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="catatan"
              placeholder={
                selectedStatus === "approved"
                  ? "Berikan apresiasi dan saran untuk pengembangan laporan..."
                  : selectedStatus === "revision"
                  ? "Jelaskan bagian mana yang perlu diperbaiki dan bagaimana seharusnya..."
                  : selectedStatus === "rejected"
                  ? "Jelaskan alasan penolakan dan arahan untuk judul yang baru..."
                  : "Pilih status verifikasi terlebih dahulu..."
              }
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={5}
              className="resize-none"
              disabled={!selectedStatus}
            />
            <p className="text-xs text-muted-foreground">
              Minimal 10 karakter. Catatan ini akan dilihat oleh mahasiswa.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedStatus || !catatan.trim() || isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Verifikasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
