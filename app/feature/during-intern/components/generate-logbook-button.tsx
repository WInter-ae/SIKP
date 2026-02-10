/**
 * Generate Logbook DOCX Button Component
 * 
 * Button untuk generate DOCX logbook dengan:
 * - Data mahasiswa dari database
 * - Logbook entries yang sudah approved
 * - E-signature mentor dari database (no canvas)
 */

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { FileDown, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { 
  generateLogbookDocx, 
  validateLogbookGeneration,
  getLogbookPreview 
} from "../services/logbook-generation-api";
import { toast } from "sonner";

interface GenerateLogbookButtonProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function GenerateLogbookButton({
  variant = "default",
  size = "default",
  className,
}: GenerateLogbookButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    canGenerate: boolean;
    reason?: string;
  } | null>(null);
  const [previewData, setPreviewData] = useState<{
    totalEntries: number;
    approvedEntries: number;
    weeks: number[];
  } | null>(null);

  const handleOpenDialog = async () => {
    setIsOpen(true);
    setIsValidating(true);

    try {
      // Validate if can generate
      const validationResponse = await validateLogbookGeneration();
      
      if (validationResponse.success && validationResponse.data) {
        setValidationResult(validationResponse.data);

        // If can generate, get preview data
        if (validationResponse.data.canGenerate) {
          const previewResponse = await getLogbookPreview();
          if (previewResponse.success && previewResponse.data) {
            const weeks = previewResponse.data.weeks.map(w => w.weekNumber);
            const totalEntries = previewResponse.data.weeks.reduce(
              (sum, w) => sum + w.entries.length, 
              0
            );
            const approvedEntries = previewResponse.data.weeks.reduce(
              (sum, w) => sum + w.entries.filter(e => e.status === "APPROVED").length,
              0
            );

            setPreviewData({
              totalEntries,
              approvedEntries,
              weeks,
            });
          }
        }
      } else {
        toast.error(validationResponse.message);
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Gagal memvalidasi logbook");
      setIsOpen(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGenerate = async () => {
    if (!validationResult?.canGenerate) {
      toast.error(validationResult?.reason || "Logbook belum bisa digenerate");
      return;
    }

    setIsGenerating(true);

    try {
      const request = selectedWeek !== "all" 
        ? { weekNumber: parseInt(selectedWeek) } 
        : undefined;

      const response = await generateLogbookDocx(request);

      if (response.success && response.data) {
        toast.success("Logbook DOCX berhasil digenerate!", {
          description: `File: ${response.data.fileName}`,
          action: {
            label: "Download",
            onClick: () => window.open(response.data!.docxUrl, '_blank'),
          },
        });

        // Auto-download
        window.open(response.data.docxUrl, '_blank');
        setIsOpen(false);
      } else {
        toast.error(response.message || "Gagal generate logbook");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat generate logbook");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpenDialog}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Generate Logbook DOCX
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate Logbook DOCX</DialogTitle>
            <DialogDescription>
              Generate file DOCX logbook dengan tanda tangan pembimbing lapangan
            </DialogDescription>
          </DialogHeader>

          {isValidating ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : validationResult?.canGenerate ? (
            <div className="space-y-4">
              {/* Success alert */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Logbook siap digenerate</p>
                    <p className="text-sm text-gray-600">
                      {previewData?.approvedEntries} dari {previewData?.totalEntries} entri 
                      sudah disetujui pembimbing lapangan
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Week selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Periode</label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih minggu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Minggu</SelectItem>
                    {previewData?.weeks.map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Minggu ke-{week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Pilih minggu tertentu atau generate semua minggu sekaligus
                </p>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ File DOCX akan berisi:
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>Data mahasiswa (Nama, NIM, Prodi)</li>
                  <li>Data tempat KP dan bagian/bidang</li>
                  <li>Logbook harian yang sudah disetujui</li>
                  <li>Tanda tangan pembimbing lapangan</li>
                </ul>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Logbook belum bisa digenerate</p>
                <p className="text-sm mt-1">
                  {validationResult?.reason || "Belum ada logbook yang disetujui"}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Batal
            </Button>
            {validationResult?.canGenerate && (
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate DOCX
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
