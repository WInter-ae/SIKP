import { useState } from "react";
import { CheckCircle, Download, Users, XCircle } from "lucide-react";
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
import { Badge } from "~/components/ui/badge";
import { generateSuratPengantarPdf } from "../lib/generate-surat-pengantar-pdf";
import type { MailEntry } from "../types/dosen";

interface MainVerificationDosenDialogProps {
  entry: MailEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (entry: MailEntry) => void;
  onReject: (id: string, reason: string) => void;
}

function CoverLetterVerificationDialog({
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

  const displayTeamMembers =
    entry.teamMembers && entry.teamMembers.length > 0
      ? entry.teamMembers
      : [
        {
          id: `fallback-${entry.id}`,
          name: entry.namaMahasiswa || "-",
          nim: entry.nim || "-",
          prodi: entry.programStudi || "-",
          role: "Ketua",
        },
      ];

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

      await generateSuratPengantarPdf(entry);
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
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Verifikasi Surat Pengantar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 flex-1 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Student Information */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                Informasi Tim Kerja Praktik
              </h3>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Dosen Pembimbing Kerja Praktik:
              </p>
              <p className="font-semibold text-primary text-lg">
                {entry.supervisor || "-"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayTeamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`min-w-0 p-4 rounded-lg border ${member.role === "Ketua"
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/50"
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={member.role === "Ketua" ? "default" : "secondary"}
                    >
                      {member.role}
                    </Badge>
                  </div>
                  <p className="font-bold text-foreground break-words">
                    {member.name}
                  </p>
                  <p className="text-sm text-muted-foreground break-all">
                    {member.nim || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground/80 break-words">
                    {member.prodi || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Surat tidak ditampilkan otomatis. Klik tombol untuk langsung
              mengunduh PDF surat.
            </p>
            <Button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPdf ? "Membuat PDF..." : "Preview Surat Pengantar"}
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-2 sm:pt-4 border-t shrink-0">
          {/* Action Buttons */}
          {entry.status === "menunggu" && !isRejectFormVisible && (
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={handleCloseMainDialog} className="w-full sm:w-auto order-3 sm:order-1">
                Tutup
              </Button>
              <Button variant="destructive" onClick={handleOpenRejectForm} className="w-full sm:w-auto order-2 sm:order-2">
                <XCircle className="w-4 h-4 mr-2" />
                Tolak Ajuan
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto order-1 sm:order-3"
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
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCloseMainDialog} className="w-full sm:w-auto">
                Tutup
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CoverLetterVerificationDialog;
