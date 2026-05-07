"use client";

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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { TemplateType, TemplateField } from "../types/template.types";
import { toast } from "sonner";
import { createTemplate } from "~/lib/services/template.service";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    toast.success(`File ${file.name} dipilih`);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nama template harus diisi");
      return;
    }

    if (!uploadedFile) {
      toast.error("File template harus diupload");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createTemplate({
        file: uploadedFile,
        name: name.trim(),
        description: description.trim(),
      });

      if (response.success) {
        resetForm();
        onSuccess();
      } else {
        // Check for specific error messages
        if (
          response.message?.includes("Forbidden") ||
          response.message?.includes("admin")
        ) {
          toast.error("Hanya admin yang dapat membuat template");
        } else {
          toast.error(response.message || "Gagal membuat template");
        }
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Terjadi kesalahan saat membuat template");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setUploadedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl border-none shadow-2xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-foreground">Buat Template Baru</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Tambahkan format dokumen resmi baru ke dalam sistem SIKP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-6">
          {/* Row 1: Nama Template */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-bold text-foreground">Nama Template</Label>
            <Input
              id="name"
              placeholder="Contoh: Berita Acara Sidang KP"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl border-gray-200 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Row 2: Upload Template File */}
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-bold text-foreground">File Template (.docx, .html, .txt)</Label>
            <Input
              id="file"
              type="file"
              accept=".html,.txt,.docx"
              onChange={handleFileUpload}
              className="cursor-pointer h-11 rounded-xl border-gray-200 file:bg-muted file:border-0 file:text-sm file:font-semibold file:mr-4 file:px-4 file:h-full transition-all"
            />
            {uploadedFile && (
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                Terpilih: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Row 3: Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-foreground">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Berikan deskripsi singkat tentang kegunaan template ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border-gray-200 focus:border-blue-500 transition-all"
            />
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
            {isLoading ? "Menyimpan..." : "Simpan Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
