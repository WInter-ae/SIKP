import React, { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Label } from "~/components/ui/label";
import { apiClient, API_BASE_URL } from "~/lib/api-client";
import { cn } from "~/lib/utils";

import type { SubmissionDocument } from "../types";

type DocumentType =
  | "PROPOSAL_KETUA"
  | "SURAT_KESEDIAAN"
  | "FORM_PERMOHONAN"
  | "KRS_SEMESTER_4"
  | "DAFTAR_KUMPULAN_NILAI"
  | "BUKTI_PEMBAYARAN_UKT";

interface DocumentUploadFormProps {
  submissionId: string;
  memberUserId: string;
  memberName: string;
  documentType: DocumentType;
  onUploadSuccess?: (document: SubmissionDocument) => void;
  onUploadError?: (error: string) => void;
}

export function DocumentUploadForm({
  submissionId,
  memberUserId,
  memberName,
  documentType,
  onUploadSuccess,
  onUploadError,
}: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File validation
  const validateFile = (selectedFile: File): string[] => {
    const errors: string[] = [];

    // Check file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      errors.push(
        `File size exceeds 10MB (current: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`
      );
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      errors.push("Only PDF and DOCX files are allowed");
    }

    // Check file extension (fallback)
    const allowedExtensions = ["pdf", "doc", "docx"];
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push("File extension must be .pdf, .doc, or .docx");
    }

    return errors;
  };

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setSuccess(false);

    const validationErrors = validateFile(selectedFile);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join("\n");
      setError(errorMessage);
      onUploadError?.(errorMessage);
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      onUploadError?.("Please select a file");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      formData.append("memberUserId", memberUserId);

      // Use apiClient with FormData body
      const response = await apiClient<SubmissionDocument>(
        `/api/submissions/${submissionId}/documents`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.success) {
        const errorMsg = response.message || "Upload failed";
        setError(errorMsg);
        onUploadError?.(errorMsg);
        return;
      }

      // Success
      setSuccess(true);
      setFile(null);
      onUploadSuccess?.(response.data!);

      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        // Reset file input
        const fileInput = document.getElementById(
          `file-upload-${submissionId}-${memberUserId}`
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }, 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const documentTypeLabels: Record<DocumentType, string> = {
    PROPOSAL_KETUA: "Proposal Ketua",
    SURAT_KESEDIAAN: "Surat Kesediaan",
    FORM_PERMOHONAN: "Form Permohonan",
    KRS_SEMESTER_4: "KRS Semester 4",
    DAFTAR_KUMPULAN_NILAI: "Daftar Kumpulan Nilai",
    BUKTI_PEMBAYARAN_UKT: "Bukti Pembayaran UKT",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {documentTypeLabels[documentType]}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">For: {memberName}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                File uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          <div>
            <Label className="block font-medium mb-2">
              Select File (PDF or DOCX, max 10MB)
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                file && "border-primary bg-primary/5"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="hidden"
                id={`file-upload-${submissionId}-${memberUserId}`}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                disabled={isLoading}
              />
              <label
                htmlFor={`file-upload-${submissionId}-${memberUserId}`}
                className="cursor-pointer block"
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                {!file && (
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF or DOCX files up to 10MB
                  </p>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!file || isLoading}
              className="flex-1"
            >
              {isLoading ? "Uploading..." : "Upload Document"}
            </Button>
            {file && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(null);
                  const fileInput = document.getElementById(
                    `file-upload-${submissionId}-${memberUserId}`
                  ) as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
                disabled={isLoading}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <p className="font-medium mb-1">Upload Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Maximum file size: 10MB</li>
              <li>Allowed formats: PDF, DOC, DOCX</li>
              <li>Document will be uploaded to Cloudflare R2 storage</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default DocumentUploadForm;
