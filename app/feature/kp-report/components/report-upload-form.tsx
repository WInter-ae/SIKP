import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Upload, FileText, X, Eye, CheckCircle2, AlertCircle } from "lucide-react";

interface ReportUploadFormProps {
  currentReport?: {
    namaFile: string;
    tanggalUpload: string;
    ukuranFile: string;
    status: "draft" | "disubmit" | "revisi" | "disetujui";
  };
  onUpload: (file: File) => void;
  onRemove?: () => void;
  disabled?: boolean;
  titleApproved?: boolean;
}

export default function ReportUploadForm({
  currentReport,
  onUpload,
  onRemove,
  disabled = false,
  titleApproved = false,
}: ReportUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Ukuran file maksimal 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveSelected = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePreview = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, "_blank");
    setTimeout(() => URL.revokeObjectURL(fileURL), 100);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disubmit":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Disubmit
          </span>
        );
      case "revisi":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Perlu Revisi
          </span>
        );
      case "disetujui":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Disetujui
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Laporan KP</CardTitle>
      </CardHeader>
      <CardContent>
        {!titleApproved && (
          <Alert className="mb-4 border-l-4 border-yellow-500 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Judul laporan harus disetujui terlebih dahulu sebelum upload laporan
            </AlertDescription>
          </Alert>
        )}

        {currentReport && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground truncate">
                      {currentReport.namaFile}
                    </p>
                    {getStatusBadge(currentReport.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ukuran: {currentReport.ukuranFile} • Diupload: {currentReport.tanggalUpload}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alert("Preview file (implementasi backend diperlukan)")}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {onRemove && currentReport.status !== "disetujui" && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onRemove}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(selectedFile)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveSelected}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            } ${disabled || !titleApproved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && titleApproved && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleInputChange}
              disabled={disabled || !titleApproved}
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-1">
              Klik untuk upload atau drag & drop file
            </p>
            <p className="text-sm text-muted-foreground">
              Format: PDF • Maksimal 10MB
            </p>
          </div>

          {selectedFile && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={disabled || !titleApproved}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Laporan
            </Button>
          )}

          <Alert className="border-l-4 border-blue-500 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Catatan:</strong> Pastikan laporan sudah final dan sesuai format sebelum
              diupload. Laporan yang sudah disubmit tidak dapat diubah kecuali diminta revisi oleh
              dosen pembimbing.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}
