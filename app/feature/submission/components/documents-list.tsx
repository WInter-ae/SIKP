import React, { useState, useEffect } from "react";
import { Download, Eye, Loader2, AlertCircle, X, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import { apiClient } from "~/lib/api-client";

import type { SubmissionDocument } from "../types";

interface DocumentsListProps {
  submissionId: string;
  onDocumentsLoaded?: (documents: SubmissionDocument[]) => void;
}

export function DocumentsList({
  submissionId,
  onDocumentsLoaded,
}: DocumentsListProps) {
  const [documents, setDocuments] = useState<SubmissionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<SubmissionDocument | null>(null);

  const documentTypeLabels: Record<string, string> = {
    PROPOSAL_KETUA: "Proposal Ketua",
    SURAT_KESEDIAAN: "Surat Kesediaan",
    FORM_PERMOHONAN: "Form Permohonan",
    KRS_SEMESTER_4: "KRS Semester 4",
    DAFTAR_KUMPULAN_NILAI: "Daftar Kumpulan Nilai",
    BUKTI_PEMBAYARAN_UKT: "Bukti Pembayaran UKT",
    SURAT_PENGANTAR: "Surat Pengantar Kerja Praktik",
  };

  useEffect(() => {
    fetchDocuments();
  }, [submissionId]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient<SubmissionDocument[]>(
        `/api/submissions/${submissionId}/documents`,
        {
          method: "GET",
        }
      );

      if (!response.success) {
        setError(response.message || "Failed to fetch documents");
        return;
      }

      const docs = response.data || [];
      setDocuments(docs);
      onDocumentsLoaded?.(docs);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error fetching documents";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // ✅ CRITICAL FIX: Pisahkan dokumen yang diupload dari SURAT_PENGANTAR
  // Sesuai guide: SURAT_PENGANTAR harus di section TERPISAH
  const uploadedDocuments = documents.filter(
    (doc) => doc.documentType !== "SURAT_PENGANTAR"
  );
  
  const suratPengantar = documents.find(
    (doc) => doc.documentType === "SURAT_PENGANTAR"
  );

  return (
    <>
      {/* Section 1: Dokumen yang Diupload (6 dokumen wajib) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>📋 Dokumen yang Diupload</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {uploadedDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedDocuments.map((doc) => {
                const badgeColorClass = "bg-primary/10 text-primary";
                
                return (
                  <div
                    key={doc.id}
                    className="border rounded-lg p-4 flex items-start justify-between hover:bg-muted/50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${badgeColorClass}`}>
                          {documentTypeLabels[doc.documentType] || doc.documentType}
                        </span>
                      </div>
                      <p className="font-medium text-sm break-words">
                        {doc.originalName}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">Size:</span>{" "}
                          {formatFileSize(doc.fileSize)}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {doc.fileType}
                        </div>
                        <div>
                          <span className="font-medium">Member:</span>{" "}
                          {doc.memberUserId}
                        </div>
                        <div>
                          <span className="font-medium">Uploaded:</span>{" "}
                          {formatDate(doc.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-10 h-10 p-0"
                        title="View document"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-10 h-10 p-0"
                        title="Download document"
                      >
                        <a href={doc.fileUrl} download={doc.originalName}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Surat Pengantar (TERPISAH - hanya jika approved) */}
      {suratPengantar && (
        <Card className="mt-6 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              📄 Surat Pengantar Kerja Praktik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-emerald-100 border-emerald-300 dark:bg-emerald-950 dark:border-emerald-700">
              <Sparkles className="h-4 w-4 text-emerald-700 dark:text-emerald-100" />
              <AlertDescription className="text-emerald-800 dark:text-emerald-100">
                <p className="font-semibold mb-1">✅ Surat Pengantar Telah Disetujui</p>
                <p className="text-sm">
                  Surat pengantar kerja praktik telah berhasil dibuat dan dapat diunduh oleh mahasiswa.
                </p>
              </AlertDescription>
            </Alert>

            <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-white dark:bg-emerald-950/40">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary" className="bg-emerald-600 text-white hover:bg-emerald-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Dibuat Otomatis oleh Sistem
                    </Badge>
                  </div>
                  <p className="font-medium text-sm break-words">
                    {suratPengantar.originalName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Size:</span>{" "}
                      {formatFileSize(suratPengantar.fileSize)}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {suratPengantar.fileType}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(suratPengantar.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0"
                    title="View document"
                    onClick={() => setPreviewDoc(suratPengantar)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    title="Download document"
                  >
                    <a href={suratPengantar.fileUrl} download={suratPengantar.originalName}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-5xl h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-4">
              <span className="truncate">{previewDoc?.originalName || "Document preview"}</span>
              <div className="flex items-center gap-2">
                {previewDoc?.fileUrl && (
                  <Button asChild size="sm" variant="outline">
                    <a href={previewDoc.fileUrl} download={previewDoc.originalName}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </a>
                  </Button>
                )}
                <DialogClose asChild>
                  <Button size="icon" variant="ghost">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {previewDoc?.documentType} • {previewDoc?.fileType} • {previewDoc?.memberUserId}
            </DialogDescription>
          </DialogHeader>

          {previewDoc?.fileUrl ? (
            <div className="relative h-full w-full bg-muted rounded-md overflow-hidden border">
              <iframe
                src={previewDoc.fileUrl}
                title={previewDoc.originalName}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Document URL not available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DocumentsList;
