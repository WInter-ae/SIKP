import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { ESignatureSetup } from "~/feature/esignature/components/esignature-setup";
import type { ESignatureSetupData } from "~/feature/esignature/types/esignature";

interface ESignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ESignatureSetupData) => void;
  dosenName: string;
  nip: string;
  existingSignature?: string;
}

export function ESignatureDialog({
  open,
  onOpenChange,
  onSave,
  dosenName,
  nip,
  existingSignature,
}: ESignatureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Tanda Tangan Digital</DialogTitle>
          <DialogDescription>
            Tanda tangan digital akan digunakan untuk menyetujui dokumen
            mahasiswa
          </DialogDescription>
        </DialogHeader>
        <ESignatureSetup
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
          dosenName={dosenName}
          nip={nip}
          existingSignature={existingSignature}
        />
      </DialogContent>
    </Dialog>
  );
}
