import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (file: File) => void;
  memberName: string;
  documentTitle: string;
}

export function FileUploadDialog({
  open,
  onOpenChange,
  onFileUpload,
  memberName,
  documentTitle,
}: FileUploadDialogProps) {
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmUpload = () => {
    if (!selectedFile) return;

    // Validasi ukuran file (maksimal 10 MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert(
        `Ukuran file terlalu besar. Maksimal 10 MB, file Anda ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
      );
      return;
    }

    onFileUpload(selectedFile);
    onOpenChange(false); // Close dialog on confirm
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {documentTitle}</DialogTitle>
          <DialogDescription>Untuk anggota: {memberName}</DialogDescription>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="hidden"
            id="file-upload-dialog"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload-dialog" className="cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground mb-2 mx-auto" />
            <p className="text-muted-foreground">
              {fileName || "Klik untuk upload atau drag and drop file"}
            </p>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirmUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
