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
import { TEMPLATE_CATEGORIES } from "../types/template.types";
import type {
  Template,
  TemplateType,
  TemplateField,
} from "../types/template.types";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { autoGenerateFields } from "../services/template.service";
import { updateTemplate, type TemplateResponse } from "~/lib/services/template-api";

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
  const [type, setType] = useState<TemplateType>(
    template?.type || "Template Only",
  );
  const [description, setDescription] = useState(template?.description || "");
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update state when template changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setType(template.type);
      setDescription(template.description || "");
      setFields(template.fields || []);
      setUploadedFile(null); // Reset file input
    }
  }, [template]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    toast.success(`File ${file.name} dipilih. File akan diupload saat menyimpan perubahan.`);
  };

  const handleSubmit = async () => {
    if (!template) return;

    if (!name.trim()) {
      toast.error("Nama template harus diisi");
      return;
    }

    if (type === "Generate & Template" && fields.length === 0 && !uploadedFile) {
      toast.error('Fields wajib diisi untuk tipe "Generate & Template"');
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateTemplate(template.id, {
        ...(uploadedFile && { file: uploadedFile }),
        name: name.trim(),
        type,
        description: description.trim(),
        fields: type === "Generate & Template" ? fields : [],
      });

      if (response.success) {
        onSuccess();
      } else {
        // Check for specific error messages
        if (response.message?.includes("Forbidden") || response.message?.includes("admin")) {
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
      <DialogContent className="!max-w-none w-[50vw] h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Edit metadata atau upload ulang file template untuk memperbarui
            konten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Template</Label>
            <Input
              id="edit-name"
              placeholder="Nama template"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Tipe</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as TemplateType)}
            >
              <SelectTrigger id="edit-type">
                <SelectValue placeholder="Pilih tipe template" />
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

          <div className="space-y-2">
            <Label htmlFor="edit-description">Deskripsi</Label>
            <Textarea
              id="edit-description"
              placeholder="Deskripsi template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload Ulang File Template (Opsional)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="file"
                type="file"
                accept=".html,.txt,.docx"
                onChange={handleFileUpload}
                className="cursor-pointer flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mengupload file baru akan menggantikan konten dan variabel
              template yang ada.
            </p>
            {uploadedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                File baru: {uploadedFile.name} (
                {(uploadedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
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
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
