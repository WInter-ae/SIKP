import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface AnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  confirmText?: string;
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Mengerti",
}: AnnouncementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-gray-900 sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="text-green-500 mb-4">
            <i className="fas fa-check-circle fa-4x"></i>
          </div>
          <DialogTitle className="text-gray-900 text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-gray-900 text-xl font-semibold text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-4">
          <Button onClick={onConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
