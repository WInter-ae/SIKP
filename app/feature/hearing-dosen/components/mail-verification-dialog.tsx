import { useState } from "react";
import { CheckCircle, Download, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { generateSuratKesediaanPdf } from "../lib/generate-surat-kesediaan-pdf";
import { generateSuratPermohonanPdf } from "../lib/generate-surat-permohonan-pdf";
import type { MailEntry } from "../types/dosen";

interface MainVerificationDosenDialogProps {
  entry: MailEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (entry: MailEntry) => void;
  onReject: (id: string, reason: string) => void;
}

function MainVerificationDosenDialog({
  entry,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: MainVerificationDosenDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isRejectFormVisible, setIsRejectFormVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!entry) return null;

  const handleCloseMainDialog = () => {
    setIsRejectFormVisible(false);
    setRejectReason("");
    onClose();
  };

  const handleOpenRejectForm = () => {
    setIsRejectFormVisible(true);
  };

  const handleCancelReject = () => {
    setIsRejectFormVisible(false);
    setRejectReason("");
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }
    onReject(entry!.id, rejectReason.trim());
    handleCloseMainDialog();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      if (entry.status === "disetujui" && entry.signedFileUrl) {
        window.open(entry.signedFileUrl, "_blank", "noopener,noreferrer");
        toast.success("Membuka surat signed dari server.");
        return;
      }

      if (entry.status === "disetujui") {
        toast.error(
          "Surat sudah disetujui, tetapi file signed dari backend belum tersedia. Pastikan backend mengirim signed_file_url/signedFileUrl.",
        );
        return;
      }

      const isPermohonan =
        entry.jenisSurat === "Surat Permohonan" ||
        entry.jenisSurat === "Form Permohonan";

      if (isPermohonan) {
        await generateSuratPermohonanPdf(entry);
      } else {
        await generateSuratKesediaanPdf(entry);
      }
      toast.success("PDF berhasil diunduh.");
    } catch (error) {
      console.error("Gagal generate PDF surat:", error);
      toast.error("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && handleCloseMainDialog()}
    >
      <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verifikasi Surat</DialogTitle>
        </DialogHeader>

        {/* Student Information */}
        <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-primary" />
            <h3 className="font-semibold text-foreground">
              Informasi Mahasiswa
            </h3>
          </div>
          <div className="grid grid-cols-1 divide-y divide-border/60 text-sm">
            {[
              { label: "NIM", value: entry.nim },
              { label: "Nama Lengkap", value: entry.namaMahasiswa },
              { label: "Program Studi", value: entry.programStudi },
              { label: "Angkatan", value: entry.angkatan },
              { label: "Semester", value: entry.semester },
              { label: "Email", value: entry.email },
              { label: "No. HP", value: entry.noHp },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center py-2 gap-4">
                <span className="text-muted-foreground w-32 shrink-0">
                  {label}
                </span>
                <span className="w-px h-4 bg-border shrink-0" />
                <span className="text-foreground font-medium">
                  {value || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Surat tidak ditampilkan otomatis. Klik tombol untuk langsung
            mengunduh PDF surat.
          </p>
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPdf ? "Membuat PDF..." : "Preview Surat"}
          </Button>
        </div>

        {/* Action Buttons */}
        {entry.status === "menunggu" && !isRejectFormVisible && (
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCloseMainDialog}>
              Tutup
            </Button>
            <Button variant="destructive" onClick={handleOpenRejectForm}>
              <XCircle className="w-4 h-4 mr-2" />
              Tolak Ajuan
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                onApprove(entry);
                handleCloseMainDialog();
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        )}

        {/* Rejection Reason Form */}
        {entry.status === "menunggu" && isRejectFormVisible && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <h4 className="font-semibold text-destructive text-sm">
                Konfirmasi Penolakan Ajuan
              </h4>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reject-reason" className="text-sm">
                Alasan Penolakan <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-reason"
                placeholder="Tuliskan alasan penolakan ajuan surat ini..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelReject}>
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Konfirmasi Tolak
              </Button>
            </div>
          </div>
        )}
        {entry.status !== "menunggu" && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={handleCloseMainDialog}>
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MainVerificationDosenDialog;
