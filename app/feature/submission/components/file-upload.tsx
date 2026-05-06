import { useState } from "react";

import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

import type { FileUploadProps } from "../types";
import { Upload } from "lucide-react";

function FileUpload({
  label,
  onFileChange,
  disabled,
}: FileUploadProps & { disabled?: boolean }) {
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    if (disabled) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }
    }
  };

  return (
    <div className="mb-4">
      <Label className="block font-medium mb-2">{label}</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-2 md:p-5 text-center cursor-pointer transition",
          disabled
            ? "border-border bg-muted cursor-not-allowed opacity-50"
            : isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <label
          htmlFor="file-upload"
          className={cn("cursor-pointer", disabled && "cursor-not-allowed")}
        >
          <Upload className="h-4 w-4 md:h-8 md:w-8 text-muted-foreground mx-auto mb-1 mt-1" />
          <p className="text-xs md:text-sm text-muted-foreground mb-2">
            {disabled
              ? "File tidak dapat diubah setelah pengajuan"
              : fileName
                ? fileName
                : "Klik untuk upload atau drag and drop file"}
          </p>
        </label>
      </div>
    </div>
  );
}

export default FileUpload;
