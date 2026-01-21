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

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    type: TemplateType;
    description: string;
    content: string;
    fileExtension: "html" | "docx" | "txt";
    fields: TemplateField[];
  }) => void;
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateTemplateDialogProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TemplateType>("berita-acara");
  const [description, setDescription] = useState("");
  const [fileExtension, setFileExtension] = useState<"html" | "docx" | "txt">("html");
  const [content, setContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Set file extension based on uploaded file
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'html' || ext === 'docx' || ext === 'txt') {
      setFileExtension(ext);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      toast.success(`File ${file.name} berhasil diupload`);
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Nama template harus diisi");
      return;
    }
    if (!content.trim()) {
      toast.error("Content template harus diisi atau upload file terlebih dahulu");
      return;
    }

    // Auto-generate fields dari content
    const fields = autoGenerateFields(content);

    onSubmit({
      name: name.trim(),
      type,
      description: description.trim(),
      content: content.trim(),
      fileExtension,
      fields,
    });

    // Reset form
    setName("");
    setType("berita-acara");
    setDescription("");
    setContent("");
    setUploadedFile(null);
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

          {/* Row 2: Jenis Template & Format File */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Jenis Template</Label>
              <Select value={type} onValueChange={(value) => setType(value as TemplateType)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih jenis template" />
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
              <Label htmlFor="fileExtension">Format File</Label>
              <Select 
                value={fileExtension} 
                onValueChange={(value) => setFileExtension(value as "html" | "docx" | "txt")}
              >
                <SelectTrigger id="fileExtension">
                  <SelectValue placeholder="Pilih format file" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="docx">DOCX</SelectItem>
                  <SelectItem value="txt">TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Button type="button" variant="outline" size="icon" className="shrink-0">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {uploadedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                File: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
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

          {/* Row 5: Konten Template Preview */}
          <div className="space-y-2">
            <Label htmlFor="content">Konten Template (Preview)</Label>
            <Textarea
              id="content"
              placeholder="Konten template akan muncul di sini setelah upload..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="font-mono text-sm w-full resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Anda dapat mengedit konten di atas atau klik "Edit" setelah template dibuat untuk menggunakan editor kode lengkap
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Simpan Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
