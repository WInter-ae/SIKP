import { FileText, Download } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import type { Student } from "../types";

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onApprove: (student: Student) => void;
}

function DetailDialog({
  open,
  onOpenChange,
  student,
  onApprove,
}: DetailDialogProps) {
  const handleApproveClick = () => {
    if (student) {
      onOpenChange(false);
      onApprove(student);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detail Surat Balasan</DialogTitle>
        </DialogHeader>
        {student && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Nama Mahasiswa
              </label>
              <p className="text-foreground">{student.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tipe
              </label>
              <p className="text-foreground">{student.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tanggal Upload
              </label>
              <p className="text-foreground">{student.tanggal}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Status
              </label>
              <Badge
                variant={
                  student.status === "Disetujui" ? "default" : "destructive"
                }
              >
                {student.status}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                File Surat Balasan
              </label>
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="font-medium text-foreground">
                        Surat_Balasan.pdf
                      </p>
                      <p className="text-sm text-muted-foreground">1.2 MB</p>
                    </div>
                  </div>
                  <Button className="mt-3 w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        <DialogFooter className="gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Tutup
          </Button>
          {student && student.status !== "Disetujui" && student.status !== "Ditolak" && (
            <Button onClick={handleApproveClick} className="flex-1">
              Setujui
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DetailDialog;
