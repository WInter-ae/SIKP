/**
 * Signature Setup Component
 * Allows mentor to create/update their digital signature (one-time setup)
 */

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { saveMentorSignature, deleteMentorSignature } from "../services/mentor-api";
import { toast } from "sonner";

interface SignatureSetupProps {
  currentSignature?: string;
  signatureSetAt?: string;
  onSaved?: () => void;
}

export function SignatureSetup({ currentSignature, signatureSetAt, onSaved }: SignatureSetupProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setPreview(null);
  };

  const handlePreview = () => {
    if (sigCanvas.current) {
      const base64 = sigCanvas.current.toDataURL("image/png");
      setPreview(base64);
    }
  };

  const handleSave = async () => {
    if (!preview) {
      toast.error("Silakan buat tanda tangan terlebih dahulu");
      return;
    }

    setIsSaving(true);
    try {
      const response = await saveMentorSignature(preview);
      if (response.success) {
        toast.success("Tanda tangan berhasil disimpan!");
        setIsOpen(false);
        handleClear();
        onSaved?.();
      } else {
        toast.error(response.message || "Gagal menyimpan tanda tangan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan tanda tangan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Hapus tanda tangan? Anda harus membuat ulang untuk approve logbook.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteMentorSignature();
      if (response.success) {
        toast.success("Tanda tangan berhasil dihapus");
        onSaved?.();
      } else {
        toast.error(response.message || "Gagal menghapus tanda tangan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus tanda tangan");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tanda Tangan Digital</CardTitle>
        <CardDescription>
          Setup tanda tangan sekali saja. Akan digunakan untuk approve semua logbook mahasiswa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSignature ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Tanda Tangan Anda:</p>
              <div className="border rounded-md p-4 bg-white inline-block">
                <img
                  src={currentSignature}
                  alt="Signature"
                  className="h-24 w-auto"
                />
              </div>
            </div>
            {signatureSetAt && (
              <p className="text-xs text-muted-foreground">
                Dibuat pada: {new Date(signatureSetAt).toLocaleString("id-ID")}
              </p>
            )}
            <div className="flex gap-2">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Edit Tanda Tangan</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Tanda Tangan</DialogTitle>
                    <DialogDescription>
                      Tanda tangan baru akan menggantikan yang lama
                    </DialogDescription>
                  </DialogHeader>
                  <SignatureDialog
                    sigCanvas={sigCanvas}
                    preview={preview}
                    onClear={handleClear}
                    onPreview={handlePreview}
                    onSave={handleSave}
                    isSaving={isSaving}
                  />
                </DialogContent>
              </Dialog>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Anda belum setup tanda tangan. Silakan buat tanda tangan untuk approve logbook mahasiswa.
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Buat Tanda Tangan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Tanda Tangan Digital</DialogTitle>
                  <DialogDescription>
                    Tanda tangan ini akan digunakan untuk approve semua logbook mahasiswa
                  </DialogDescription>
                </DialogHeader>
                <SignatureDialog
                  sigCanvas={sigCanvas}
                  preview={preview}
                  onClear={handleClear}
                  onPreview={handlePreview}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SignatureDialogProps {
  sigCanvas: React.RefObject<SignatureCanvas | null>;
  preview: string | null;
  onClear: () => void;
  onPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
}

function SignatureDialog({
  sigCanvas,
  preview,
  onClear,
  onPreview,
  onSave,
  isSaving,
}: SignatureDialogProps) {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-md bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "w-full h-48 cursor-crosshair",
          }}
          backgroundColor="white"
          penColor="black"
        />
      </div>

      <div className="flex gap-2 justify-between">
        <Button type="button" variant="outline" onClick={onClear}>
          Hapus
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onPreview}>
            Preview
          </Button>
          <Button type="button" onClick={onSave} disabled={!preview || isSaving}>
            {isSaving ? "Menyimpan..." : "Simpan Tanda Tangan"}
          </Button>
        </div>
      </div>

      {preview && (
        <div className="border rounded-md p-4 bg-gray-50">
          <p className="text-sm font-medium mb-2">Preview:</p>
          <img src={preview} alt="Preview" className="h-24 border bg-white" />
        </div>
      )}
    </div>
  );
}
