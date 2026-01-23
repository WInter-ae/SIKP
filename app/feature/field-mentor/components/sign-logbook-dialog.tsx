import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { LogbookEntry } from "../types/logbook";

interface SignLogbookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logbook: LogbookEntry | null;
  onSign: (
    logbookId: string,
    status: "approved" | "revision" | "rejected",
    notes: string
  ) => void;
}

export default function SignLogbookDialog({
  open,
  onOpenChange,
  logbook,
  onSign,
}: SignLogbookDialogProps) {
  const [status, setStatus] = useState<"approved" | "revision" | "rejected">(
    "approved"
  );
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!logbook) return;
    onSign(logbook.id, status, notes);
    setNotes("");
    setStatus("approved");
    onOpenChange(false);
  };

  if (!logbook) return null;

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "revision":
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Perlu Revisi
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paraf Logbook Mahasiswa</DialogTitle>
          <DialogDescription>
            Berikan paraf dan catatan untuk logbook mahasiswa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Mahasiswa:</span>
                <p className="font-medium">{logbook.studentName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tanggal:</span>
                <p className="font-medium">
                  {new Date(logbook.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Logbook Content */}
          <div className="space-y-2">
            <Label>Kegiatan yang Dilakukan</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{logbook.activities}</p>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Status Approval</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Disetujui
                  </div>
                </SelectItem>
                <SelectItem value="revision">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                    Perlu Revisi
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    Ditolak
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Catatan {status !== "approved" && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                status === "approved"
                  ? "Tambahkan catatan (opsional)"
                  : "Berikan alasan revisi atau penolakan"
              }
              className="min-h-[100px]"
            />
          </div>

          {/* Preview */}
          <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Preview Status:</span>
              {getStatusBadge(status)}
            </div>
            {notes && (
              <p className="text-sm text-muted-foreground mt-2">
                Catatan: {notes}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={status !== "approved" && !notes.trim()}
          >
            Berikan Paraf
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
