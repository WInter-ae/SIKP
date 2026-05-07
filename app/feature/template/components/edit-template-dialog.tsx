"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type {
  Template,
  TemplateType,
  TemplateField,
} from "../types/template.types";
import { toast } from "sonner";
import {
  updateTemplate,
  type TemplateResponse,
} from "~/lib/services/template.service";

interface EditTemplateDialogProps {
  template: TemplateResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditTemplateDialog({
  template,
  open,
  onOpenChange,
  onSuccess,
}: EditTemplateDialogProps) {
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setUploadedFile(null); // Reset file input
    }
  }, [template]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    toast.success(
      `File ${file.name} dipilih. File akan diupload saat menyimpan perubahan.`,
    );
  };

  const handleSubmit = async () => {
    if (!template) return;

    if (!name.trim()) {
      toast.error("Nama template harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateTemplate(template.id, {
        ...(uploadedFile && { file: uploadedFile }),
        name: name.trim(),
        description: description.trim(),
      });

      if (response.success) {
        onSuccess();
      } else {
        // Check for specific error messages
        if (
          response.message?.includes("Forbidden") ||
          response.message?.includes("admin")
        ) {
          toast.error("Hanya admin yang dapat mengupdate template");
        } else {
          toast.error(response.message || "Gagal mengupdate template");
        }
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Terjadi kesalahan saat mengupdate template");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl border-none shadow-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-foreground">Edit Template</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Perbarui informasi atau file template yang sudah ada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-bold text-foreground">Nama Template</Label>
            <Input
              id="edit-name"
              placeholder="Nama template"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border-gray-200 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-bold text-foreground">Deskripsi (Opsional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Deskripsi template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border-gray-200 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-bold text-foreground">Ganti File Template (Opsional)</Label>
            <Input
              id="file"
              type="file"
              accept=".html,.txt,.docx"
              onChange={handleFileUpload}
              className="cursor-pointer h-11 rounded-xl border-gray-200 file:bg-muted file:border-0 file:text-sm file:font-semibold file:mr-4 file:px-4 file:h-full transition-all"
            />
            {!uploadedFile ? (
              <p className="text-[10px] font-medium text-muted-foreground italic mt-1">
                Biarkan kosong jika tidak ingin mengganti file.
              </p>
            ) : (
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                File Baru: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-xl font-bold text-muted-foreground hover:bg-muted"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-lg shadow-blue-500/20"
          >
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
