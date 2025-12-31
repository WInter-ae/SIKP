import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Info } from "lucide-react";
import type { GradingFormData } from "../types";

interface GradingFormProps {
  initialData?: Partial<GradingFormData>;
  onSubmit: (data: GradingFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function GradingForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: GradingFormProps) {
  const [formData, setFormData] = useState<GradingFormData>({
    reportSystematics: initialData?.reportSystematics || 0,
    reportContent: initialData?.reportContent || 0,
    reportAnalysis: initialData?.reportAnalysis || 0,
    presentationDelivery: initialData?.presentationDelivery || 0,
    presentationMastery: initialData?.presentationMastery || 0,
    presentationQA: initialData?.presentationQA || 0,
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof GradingFormData,
    value: number | string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate report scores
    if (formData.reportSystematics < 0 || formData.reportSystematics > 100) {
      newErrors.reportSystematics = "Nilai harus antara 0-100";
    }
    if (formData.reportContent < 0 || formData.reportContent > 100) {
      newErrors.reportContent = "Nilai harus antara 0-100";
    }
    if (formData.reportAnalysis < 0 || formData.reportAnalysis > 100) {
      newErrors.reportAnalysis = "Nilai harus antara 0-100";
    }

    // Validate presentation scores
    if (
      formData.presentationDelivery < 0 ||
      formData.presentationDelivery > 100
    ) {
      newErrors.presentationDelivery = "Nilai harus antara 0-100";
    }
    if (
      formData.presentationMastery < 0 ||
      formData.presentationMastery > 100
    ) {
      newErrors.presentationMastery = "Nilai harus antara 0-100";
    }
    if (formData.presentationQA < 0 || formData.presentationQA > 100) {
      newErrors.presentationQA = "Nilai harus antara 0-100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Calculate weighted scores
  const reportScore =
    formData.reportSystematics * 0.2 +
    formData.reportContent * 0.4 +
    formData.reportAnalysis * 0.4;

  const presentationScore =
    formData.presentationDelivery * 0.3 +
    formData.presentationMastery * 0.5 +
    formData.presentationQA * 0.2;

  const totalScore = (reportScore + presentationScore) / 2;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Report Section */}
      <Card>
        <CardHeader>
          <CardTitle>Penilaian Laporan Kerja Praktik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Bobot: Sistematika (20%), Isi & Pembahasan (40%), Analisis (40%)
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reportSystematics">
              Sistematika Penulisan (0-100)
            </Label>
            <Input
              id="reportSystematics"
              type="number"
              min="0"
              max="100"
              value={formData.reportSystematics}
              onChange={(e) =>
                handleInputChange("reportSystematics", Number(e.target.value))
              }
              className={errors.reportSystematics ? "border-red-500" : ""}
            />
            {errors.reportSystematics && (
              <p className="text-sm text-red-500">{errors.reportSystematics}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportContent">Isi dan Pembahasan (0-100)</Label>
            <Input
              id="reportContent"
              type="number"
              min="0"
              max="100"
              value={formData.reportContent}
              onChange={(e) =>
                handleInputChange("reportContent", Number(e.target.value))
              }
              className={errors.reportContent ? "border-red-500" : ""}
            />
            {errors.reportContent && (
              <p className="text-sm text-red-500">{errors.reportContent}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportAnalysis">
              Analisis dan Kesimpulan (0-100)
            </Label>
            <Input
              id="reportAnalysis"
              type="number"
              min="0"
              max="100"
              value={formData.reportAnalysis}
              onChange={(e) =>
                handleInputChange("reportAnalysis", Number(e.target.value))
              }
              className={errors.reportAnalysis ? "border-red-500" : ""}
            />
            {errors.reportAnalysis && (
              <p className="text-sm text-red-500">{errors.reportAnalysis}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Nilai Laporan</div>
            <div className="text-2xl font-bold text-blue-700">
              {reportScore.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Presentation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Penilaian Presentasi & Ujian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Bobot: Penyampaian (30%), Penguasaan Materi (50%), Kemampuan
              Menjawab (20%)
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="presentationDelivery">
              Penyampaian Materi (0-100)
            </Label>
            <Input
              id="presentationDelivery"
              type="number"
              min="0"
              max="100"
              value={formData.presentationDelivery}
              onChange={(e) =>
                handleInputChange(
                  "presentationDelivery",
                  Number(e.target.value),
                )
              }
              className={errors.presentationDelivery ? "border-red-500" : ""}
            />
            {errors.presentationDelivery && (
              <p className="text-sm text-red-500">
                {errors.presentationDelivery}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentationMastery">
              Penguasaan Materi (0-100)
            </Label>
            <Input
              id="presentationMastery"
              type="number"
              min="0"
              max="100"
              value={formData.presentationMastery}
              onChange={(e) =>
                handleInputChange("presentationMastery", Number(e.target.value))
              }
              className={errors.presentationMastery ? "border-red-500" : ""}
            />
            {errors.presentationMastery && (
              <p className="text-sm text-red-500">
                {errors.presentationMastery}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentationQA">Kemampuan Menjawab (0-100)</Label>
            <Input
              id="presentationQA"
              type="number"
              min="0"
              max="100"
              value={formData.presentationQA}
              onChange={(e) =>
                handleInputChange("presentationQA", Number(e.target.value))
              }
              className={errors.presentationQA ? "border-red-500" : ""}
            />
            {errors.presentationQA && (
              <p className="text-sm text-red-500">{errors.presentationQA}</p>
            )}
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 mb-1">Nilai Presentasi</div>
            <div className="text-2xl font-bold text-purple-700">
              {presentationScore.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan Penilaian (Opsional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tambahkan catatan atau komentar tentang penilaian mahasiswa..."
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Total Score Summary */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            Ringkasan Nilai Akhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Nilai Laporan</div>
              <div className="text-xl font-bold text-blue-700">
                {reportScore.toFixed(2)}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-purple-600 mb-1">
                Nilai Presentasi
              </div>
              <div className="text-xl font-bold text-purple-700">
                {presentationScore.toFixed(2)}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-500">
              <div className="text-sm text-green-600 mb-1">
                Total Nilai Dosen
              </div>
              <div className="text-2xl font-bold text-green-700">
                {totalScore.toFixed(2)}
              </div>
            </div>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Total nilai dosen merupakan rata-rata dari nilai laporan dan
              presentasi. Nilai akhir akan dihitung bersama dengan nilai
              pembimbing lapangan.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Nilai"}
        </Button>
      </div>
    </form>
  );
}
