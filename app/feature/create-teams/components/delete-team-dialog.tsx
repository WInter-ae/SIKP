import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamCode: string;
  reason: "join_other_team" | "manual_delete";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteTeamDialog({
  open,
  onOpenChange,
  teamCode,
  reason,
  onConfirm,
  isLoading = false,
}: DeleteTeamDialogProps) {
  const getDialogContent = () => {
    if (reason === "join_other_team") {
      return {
        title: "Perhatian: Tim Lama Akan Dihapus",
        description: (
          <div className="space-y-3">
            <p>
              Anda sedang bergabung dengan tim lain. Sistem harus menghapus tim
              lama Anda agar sesuai dengan aturan <strong>"Satu Mahasiswa - Satu Tim"</strong>.
            </p>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Tim yang akan dihapus:</strong> {teamCode}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                Tindakan ini tidak dapat dibatalkan. Semua data anggota tim akan
                dihapus dari sistem.
              </p>
            </div>
            <p className="text-sm">
              Apakah Anda yakin ingin melanjutkan dan menghapus tim ini?
            </p>
          </div>
        ),
        confirmText: "Ya, Hapus Tim",
        cancelText: "Batal",
      };
    }

    return {
      title: "Hapus Tim",
      description: (
        <div className="space-y-3">
          <p>
            Apakah Anda yakin ingin menghapus tim dengan kode <strong>{teamCode}</strong>?
          </p>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-3">
            <p className="text-xs text-red-700 dark:text-red-300">
              ⚠️ Tindakan ini tidak dapat dibatalkan. Semua data anggota tim akan
              dihapus dari sistem.
            </p>
          </div>
        </div>
      ),
      confirmText: "Ya, Hapus Tim",
      cancelText: "Batal",
    };
  };

  const content = getDialogContent();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDialogTitle className="text-red-600">
              {content.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-foreground pt-2">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {content.cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Menghapus..." : content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
