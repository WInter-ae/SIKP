/**
 * Approve Logbook Button Component
 * Simple button untuk approve logbook dengan signature otomatis dari profile mentor
 * No need signature canvas - signature diambil dari mentors.signature
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
import { CheckCircle, Loader2 } from "lucide-react";
import { approveLogbook } from "../services/mentor-api";
import { toast } from "sonner";

interface ApproveLogbookButtonProps {
  logbookId: string;
  studentName?: string;
  date?: string;
  activity?: string;
  onSuccess?: () => void;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ApproveLogbookButton({
  logbookId,
  studentName,
  date,
  activity,
  onSuccess,
  variant = "default",
  size = "sm",
}: ApproveLogbookButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const response = await approveLogbook(logbookId, notes || undefined);
      
      if (response.success) {
        toast.success("Logbook berhasil disetujui dengan paraf Anda!");
        setIsOpen(false);
        setNotes("");
        onSuccess?.();
      } else {
        toast.error(response.message || "Gagal menyetujui logbook");
      }
    } catch (error: any) {
      // Check if error is about missing signature
      if (error?.message?.includes("signature") || error?.message?.includes("tanda tangan")) {
        toast.error("Silakan setup tanda tangan di profil Anda terlebih dahulu", {
          action: {
            label: "Ke Profil",
            onClick: () => window.location.href = "/mentor/profile",
          },
        });
      } else {
        toast.error("Terjadi kesalahan saat menyetujui logbook");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick approve without dialog (if no details needed)
  const handleQuickApprove = async () => {
    if (!studentName) {
      // If no student name, just open dialog
      setIsOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await approveLogbook(logbookId);
      
      if (response.success) {
        toast.success("Logbook berhasil disetujui!");
        onSuccess?.();
      } else {
        toast.error(response.message || "Gagal menyetujui logbook");
      }
    } catch (error: any) {
      if (error?.message?.includes("signature") || error?.message?.includes("tanda tangan")) {
        toast.error("Silakan setup tanda tangan di profil Anda terlebih dahulu", {
          action: {
            label: "Ke Profil",
            onClick: () => window.location.href = "/mentor/profile",
          },
        });
      } else {
        toast.error("Terjadi kesalahan saat menyetujui logbook");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Paraf
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Paraf Logbook</DialogTitle>
          <DialogDescription>
            Berikan paraf untuk menyetujui logbook ini. Tanda tangan Anda akan otomatis ditambahkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Logbook Info */}
          {(studentName || date || activity) && (
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              {studentName && (
                <div>
                  <span className="text-muted-foreground">Mahasiswa: </span>
                  <span className="font-medium">{studentName}</span>
                </div>
              )}
              {date && (
                <div>
                  <span className="text-muted-foreground">Tanggal: </span>
                  <span className="font-medium">
                    {new Date(date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {activity && (
                <div>
                  <span className="text-muted-foreground">Kegiatan: </span>
                  <p className="font-medium mt-1">{activity}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Catatan <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan atau feedback untuk mahasiswa..."
              className="min-h-[100px]"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              ✓ Tanda tangan digital Anda akan otomatis ditambahkan dari profil
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Setujui & Paraf
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Bulk Approve Button - untuk approve multiple logbooks sekaligus
 */
interface BulkApproveButtonProps {
  studentId: string;
  studentName: string;
  pendingCount: number;
  onSuccess?: () => void;
}

export function BulkApproveButton({
  studentId,
  studentName,
  pendingCount,
  onSuccess,
}: BulkApproveButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBulkApprove = async () => {
    setIsSubmitting(true);
    try {
      // Import approveAllLogbooks when needed
      const { approveAllLogbooks } = await import("../services/mentor-api");
      const response = await approveAllLogbooks(studentId, notes || undefined);
      
      if (response.success) {
        toast.success(`${response.data?.approved || pendingCount} logbook berhasil disetujui!`);
        setIsOpen(false);
        setNotes("");
        onSuccess?.();
      } else {
        toast.error(response.message || "Gagal menyetujui logbook");
      }
    } catch (error: any) {
      if (error?.message?.includes("signature") || error?.message?.includes("tanda tangan")) {
        toast.error("Silakan setup tanda tangan di profil Anda terlebih dahulu", {
          action: {
            label: "Ke Profil",
            onClick: () => window.location.href = "/mentor/profile",
          },
        });
      } else {
        toast.error("Terjadi kesalahan saat menyetujui logbook");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={isSubmitting || pendingCount === 0}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Paraf Semua ({pendingCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Paraf Semua Logbook</DialogTitle>
          <DialogDescription>
            Setujui {pendingCount} logbook pending dari {studentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-900">
              ⚠️ Semua logbook yang berstatus PENDING akan disetujui dan diberi paraf
            </p>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="bulk-notes">
              Catatan <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <Textarea
              id="bulk-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan akan ditambahkan ke semua logbook yang disetujui..."
              className="min-h-[100px]"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              ✓ Tanda tangan digital Anda akan otomatis ditambahkan ke semua logbook
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={handleBulkApprove} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Setujui {pendingCount} Logbook
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
