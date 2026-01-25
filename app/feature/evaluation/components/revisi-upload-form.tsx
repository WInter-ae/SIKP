import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import type { RevisiKP } from "../types";

interface RevisiUploadFormProps {
  revisi: RevisiKP;
  onUpload: (revisiId: string, file: File, catatan: string) => Promise<void>;
  onCancel?: () => void;
}

export function RevisiUploadForm({ revisi, onUpload, onCancel }: RevisiUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [catatan, setCatatan] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi file PDF dan ukuran max 10MB
      if (file.type !== "application/pdf") {
        setError("File harus berformat PDF");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Ukuran file maksimal 10MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Pilih file PDF terlebih dahulu");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(revisi.id, selectedFile, catatan);
      setSelectedFile(null);
      setCatatan("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupload file");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getPrioritasColor = (prioritas: string) => {
    switch (prioritas) {
      case "tinggi": return "text-red-600 bg-red-50 border-red-200";
      case "sedang": return "text-orange-600 bg-orange-50 border-orange-200";
      case "rendah": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Revisi
        </CardTitle>
        <CardDescription>
          Upload file hasil revisi dalam format PDF
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Revisi */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Jenis Revisi</p>
              <p className="font-medium capitalize">{revisi.jenisRevisi.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prioritas</p>
              <span className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getPrioritasColor(revisi.prioritas)}`}>
                {revisi.prioritas.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Deskripsi Revisi</p>
              <p className="text-sm">{revisi.deskripsiRevisi}</p>
            </div>
            {revisi.catatanDosen && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Catatan Dosen</p>
                <p className="text-sm">{revisi.catatanDosen}</p>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">File PDF Revisi *</Label>
            <div className="space-y-3">
              {!selectedFile ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium mb-1">Klik untuk upload file PDF</p>
                    <p className="text-sm text-muted-foreground">
                      Maksimal 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Catatan Mahasiswa */}
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan (Opsional)</Label>
            <Textarea
              id="catatan"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan terkait revisi yang telah dilakukan..."
              rows={4}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Mengupload...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Upload Revisi
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isUploading}
              >
                Batal
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
