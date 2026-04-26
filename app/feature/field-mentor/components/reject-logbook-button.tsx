/**
 * Reject Logbook Button Component
 * Button untuk reject/tolak logbook dengan catatan revisi
 */

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { XCircle, Loader2, AlertCircle } from "lucide-react";
import { rejectLogbook } from "../services/mentor-api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface RejectLogbookButtonProps {
  logbookId: string;
  studentName?: string;
  date?: string;
  activity?: string;
  onSuccess?: () => void;
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function RejectLogbookButton({
  logbookId,
  studentName,
  date,
  activity,
  onSuccess,
  variant = "destructive",
  size = "sm",
}: RejectLogbookButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    // Validasi: rejection note harus diisi
    if (!rejectionNote.trim()) {
      toast.error("Catatan revisi harus diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await rejectLogbook(logbookId, rejectionNote.trim());

      if (response.success) {
        toast.success(
          "Logbook ditolak. Mahasiswa akan melihat catatan revisi Anda.",
        );
        setIsOpen(false);
        setRejectionNote("");
        onSuccess?.();
      } else {
        toast.error(response.message || "Gagal menolak logbook");
      }
    } catch (error: any) {
      console.error("Error rejecting logbook:", error);
      toast.error("Terjadi kesalahan saat menolak logbook");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <XCircle className="h-4 w-4 mr-2" />
          Tolak
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Tolak Logbook
          </DialogTitle>
          <DialogDescription>
            Berikan catatan revisi untuk mahasiswa agar mereka tahu apa yang
            perlu diperbaiki.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info logbook */}
          {(studentName || date || activity) && (
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
              {studentName && (
                <p>
                  <span className="font-medium">Mahasiswa:</span> {studentName}
                </p>
              )}
              {date && (
                <p>
                  <span className="font-medium">Tanggal:</span>{" "}
                  {new Date(date).toLocaleDateString("id-ID")}
                </p>
              )}
              {activity && (
                <p>
                  <span className="font-medium">Kegiatan:</span> {activity}
                </p>
              )}
            </div>
          )}

          {/* Alert */}
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Setelah ditolak, mahasiswa perlu memperbaiki logbook sesuai
              catatan Anda dan submit ulang.
            </AlertDescription>
          </Alert>

          {/* Rejection note textarea */}
          <div className="space-y-2">
            <Label htmlFor="rejectionNote" className="text-destructive">
              Catatan Revisi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejectionNote"
              placeholder="Contoh: Deskripsi kegiatan kurang detail. Mohon tambahkan teknologi yang digunakan dan hasil yang dicapai."
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {rejectionNote.length}/500 karakter
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setRejectionNote("");
            }}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || !rejectionNote.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Tolak Logbook
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
