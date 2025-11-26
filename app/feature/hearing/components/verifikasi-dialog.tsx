import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";

interface VerifikasiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "approved" | "rejected";
  mahasiswa: {
    nama: string;
    nim: string;
  };
  onSubmit: (catatan: string, nilai?: number) => void;
}

export function VerifikasiDialog({
  open,
  onOpenChange,
  type,
  mahasiswa,
  onSubmit,
}: VerifikasiDialogProps) {
  const [catatan, setCatatan] = useState("");
  const [nilai, setNilai] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (type === "approved" && !nilai) {
      alert("Nilai akhir wajib diisi untuk persetujuan");
      return;
    }

    if (!catatan.trim()) {
      alert("Catatan wajib diisi");
      return;
    }

    setIsSubmitting(true);
    
    // Simulasi delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSubmit(catatan, nilai ? parseFloat(nilai) : undefined);
    
    // Reset form
    setCatatan("");
    setNilai("");
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setCatatan("");
    setNilai("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            {type === "approved" ? "✅ Setujui Pengajuan Sidang" : "❌ Tolak Pengajuan Sidang"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {type === "approved" 
              ? "Anda akan menyetujui pengajuan sidang dari mahasiswa berikut:"
              : "Anda akan menolak pengajuan sidang dari mahasiswa berikut:"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Mahasiswa */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="font-semibold text-base">{mahasiswa.nama}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">NIM: {mahasiswa.nim}</p>
          </div>

          {/* Input Nilai (hanya untuk approve) */}
          {type === "approved" && (
            <div className="space-y-2">
              <Label htmlFor="nilai" className="text-base font-semibold">
                Nilai Akhir <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nilai"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={nilai}
                onChange={(e) => setNilai(e.target.value)}
                placeholder="Masukkan nilai akhir (0-100)"
                className="h-11"
              />
              <p className="text-sm text-gray-500">
                Nilai akan ditampilkan pada berita acara mahasiswa
              </p>
            </div>
          )}

          {/* Input Catatan */}
          <div className="space-y-2">
            <Label htmlFor="catatan" className="text-base font-semibold">
              Catatan {type === "approved" ? "Penilaian" : "Penolakan"} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder={
                type === "approved"
                  ? "Berikan catatan atau komentar untuk mahasiswa (misalnya: Presentasi baik, laporan lengkap...)"
                  : "Berikan alasan penolakan dan apa yang perlu diperbaiki mahasiswa"
              }
              className="min-h-[120px] resize-none"
            />
            <p className="text-sm text-gray-500">
              Catatan ini akan dilihat oleh mahasiswa
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="h-11"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`h-11 font-semibold ${
              type === "approved"
                ? "bg-green-700 hover:bg-green-800"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Memproses...
              </>
            ) : (
              type === "approved" ? "Setujui" : "Tolak"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
