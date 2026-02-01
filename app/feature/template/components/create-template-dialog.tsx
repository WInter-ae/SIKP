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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { TEMPLATE_CATEGORIES } from "../types/template.types";
import type { TemplateType, TemplateField } from "../types/template.types";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { autoGenerateFields } from "../services/template.service";
import { createTemplate } from "~/lib/services/template-api";

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
  const [type, setType] = useState<TemplateType | "">("");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
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
    if (!type) {
      toast.error("Tipe template harus dipilih");
      return;
    }
    if (!uploadedFile) {
      toast.error("File template harus diupload");
      return;
    }

    if (type === "Generate & Template" && fields.length === 0) {
      toast.error('Fields wajib diisi untuk tipe "Generate & Template"');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createTemplate({
        file: uploadedFile,
        name: name.trim(),
        type,
        description: description.trim(),
        fields: type === "Generate & Template" ? fields : [],
        isActive: true,
      });

      if (response.success) {
        resetForm();
        onSuccess();
      } else {
        // Check for specific error messages
        if (response.message?.includes("Forbidden") || response.message?.includes("admin")) {
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
    setType("");
    setDescription("");
    setUploadedFile(null);
    setFields([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[85vw] h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buat Template Baru</DialogTitle>
          <DialogDescription>
            Upload atau buat template baru untuk dokumen mahasiswa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Row 1: Nama Template (Full Width) */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Template</Label>
            <Input
              id="name"
              placeholder="Contoh: Berita Acara Sidang KP 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Row 2: Tipe */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipe</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as TemplateType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Upload Template File (Full Width) */}
          <div className="space-y-2">
            <Label htmlFor="file">Upload Template File</Label>
            <div className="flex items-center gap-3">
              <Input
                id="file"
                type="file"
                accept=".html,.txt,.docx"
                onChange={handleFileUpload}
                className="cursor-pointer flex-1"
              />
            </div>
            {uploadedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                File: {uploadedFile.name} (
                {(uploadedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Row 4: Deskripsi (Full Width) */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang template ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none"
            />
          </div>

          {/* Row 5: Konten Template Preview (Removed) */}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
