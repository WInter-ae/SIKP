import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  approveGradeByDosen,
  rejectGradeByDosen,
  approveGradeByKaprodi,
  rejectGradeByKaprodi,
} from "../services/approval-api";
import type { CombinedGradeWithApproval } from "../types/approval.d";

interface ApprovalDialogProps {
  grade: CombinedGradeWithApproval;
  role: "DOSEN" | "KAPRODI";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ApprovalDialog({
  grade,
  role,
  open,
  onOpenChange,
  onSuccess,
}: ApprovalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const handleApprove = async () => {
    setIsSubmitting(true);

    try {
      const approveFunction =
        role === "DOSEN" ? approveGradeByDosen : approveGradeByKaprodi;

      const response = await approveFunction({
        gradeId: grade.id,
      });

      if (response.success) {
        toast.success(response.message);
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat approve");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionNote.trim()) {
      toast.error("Silakan masukkan alasan penolakan");
      return;
    }

    setIsSubmitting(true);

    try {
      const rejectFunction =
        role === "DOSEN" ? rejectGradeByDosen : rejectGradeByKaprodi;

      const response = await rejectFunction({
        gradeId: grade.id,
        rejectionNote: rejectionNote.trim(),
      });

      if (response.success) {
        toast.success(response.message);
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat reject");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      setAction(null);
      setRejectionNote("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {action === null && `Approval Nilai KP - ${role}`}
            {action === "approve" && "Approve dengan E-Signature"}
            {action === "reject" && "Tolak Nilai KP"}
          </DialogTitle>
          <DialogDescription>
            {action === null &&
              `Mahasiswa: ${grade.studentName} (${grade.nim})`}
            {action === "approve" &&
              "Buat tanda tangan digital untuk approve nilai KP"}
            {action === "reject" &&
              "Berikan alasan penolakan untuk nilai KP ini"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Grade Summary */}
          {action === null && (
            <div className="space-y-3">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Nilai Mentor Lapangan (30%):</span>
                      <span className="font-semibold">
                        {grade.fieldMentorScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nilai Dosen Pembimbing (70%):</span>
                      <span className="font-semibold">
                        {grade.academicSupervisorScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Total Nilai:</span>
                      <span className="font-bold">
                        {grade.totalScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grade:</span>
                      <span className="font-bold text-lg">{grade.grade}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={`font-semibold ${
                          grade.status === "lulus"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {grade.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => setAction("approve")}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setAction("reject")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Tolak
                </Button>
              </div>
            </div>
          )}

          {/* Approve: Simple confirmation */}
          {action === "approve" && (
            <div className="space-y-3">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm">
                    Dengan menekan tombol <strong>"Tanda Tangani & Approve"</strong>, 
                    Anda menyetujui nilai ini. Tanda tangan digital akan diambil dari profil Anda.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Reject: Notes */}
          {action === "reject" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Alasan Penolakan <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Masukkan alasan penolakan..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {action !== null && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setAction(null);
                  setRejectionNote("");
                }}
                disabled={isSubmitting}
              >
                Kembali
              </Button>
              {action === "approve" && (
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Memproses..." : "Approve & Tanda Tangan"}
                </Button>
              )}
              {action === "reject" && (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Konfirmasi Penolakan"}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
