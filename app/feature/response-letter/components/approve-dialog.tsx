import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

import type { Student } from "../types";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onConfirm: () => void;
}

function ApproveDialog({
  open,
  onOpenChange,
  student,
  onConfirm,
}: ApproveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Setujui Surat Balasan</DialogTitle>
          <DialogDescription>
            {student &&
              `Apakah Anda yakin ingin menyetujui surat balasan dari ${student.name}?`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Batal
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Setujui
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ApproveDialog;
