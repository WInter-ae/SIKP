import { useState, useEffect } from "react";
import { useParams } from "react-router";
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
  const { id } = useParams();
  const [formData, setFormData] = useState<GradingFormData>({
    reportFormat: initialData?.reportFormat || 0,
    materialMastery: initialData?.materialMastery || 0,
    analysisDesign: initialData?.analysisDesign || 0,
    attitudeEthics: initialData?.attitudeEthics || 0,
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save to localStorage when form data changes
  useEffect(() => {
    if (!id) return;
    
    const timer = setTimeout(() => {
      localStorage.setItem(`grading-draft-${id}`, JSON.stringify(formData));
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [formData, id]);

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

    // Validate all scores
    if (formData.reportFormat < 0 || formData.reportFormat > 100) {
      newErrors.reportFormat = "Nilai harus antara 0-100";
    }
    if (formData.materialMastery < 0 || formData.materialMastery > 100) {
      newErrors.materialMastery = "Nilai harus antara 0-100";
    }
    if (formData.analysisDesign < 0 || formData.analysisDesign > 100) {
      newErrors.analysisDesign = "Nilai harus antara 0-100";
    }
    if (formData.attitudeEthics < 0 || formData.attitudeEthics > 100) {
      newErrors.attitudeEthics = "Nilai harus antara 0-100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Clear draft from localStorage after successful submission
      if (id) {
        localStorage.removeItem(`grading-draft-${id}`);
      }
      onSubmit(formData);
    }
  };

  // Calculate weighted total score
  const totalScore =
    formData.reportFormat * 0.3 +
    formData.materialMastery * 0.3 +
    formData.analysisDesign * 0.3 +
    formData.attitudeEthics * 0.1;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Grading Section */}
      <Card>
        <CardHeader>
          <CardTitle>Penilaian Dosen Pembimbing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Bobot: Kesesuaian Laporan (30%), Penguasaan Materi (30%), Analisis
              & Perancangan (30%), Sikap & Etika (10%)
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reportFormat">
              Kesesuaian Laporan dengan Format (0-100)
              <span className="text-sm text-muted-foreground ml-2">
                Bobot: 30%
              </span>
            </Label>
            <Input
              id="reportFormat"
              type="number"
              min="0"
              max="100"
              value={formData.reportFormat}
              onChange={(e) =>
                handleInputChange("reportFormat", Number(e.target.value))
              }
              className={errors.reportFormat ? "border-red-500" : ""}
            />
            {errors.reportFormat && (
              <p className="text-sm text-red-500">{errors.reportFormat}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialMastery">
              Penguasaan Materi KP (0-100)
              <span className="text-sm text-muted-foreground ml-2">
                Bobot: 30%
              </span>
            </Label>
            <Input
              id="materialMastery"
              type="number"
              min="0"
              max="100"
              value={formData.materialMastery}
              onChange={(e) =>
                handleInputChange("materialMastery", Number(e.target.value))
              }
              className={errors.materialMastery ? "border-red-500" : ""}
            />
            {errors.materialMastery && (
              <p className="text-sm text-red-500">{errors.materialMastery}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysisDesign">
              Analisis dan Perancangan (0-100)
              <span className="text-sm text-muted-foreground ml-2">
                Bobot: 30%
              </span>
            </Label>
            <Input
              id="analysisDesign"
              type="number"
              min="0"
              max="100"
              value={formData.analysisDesign}
              onChange={(e) =>
                handleInputChange("analysisDesign", Number(e.target.value))
              }
              className={errors.analysisDesign ? "border-red-500" : ""}
            />
            {errors.analysisDesign && (
              <p className="text-sm text-red-500">{errors.analysisDesign}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attitudeEthics">
              Sikap dan Etika (0-100)
              <span className="text-sm text-muted-foreground ml-2">
                Bobot: 10%
              </span>
            </Label>
            <Input
              id="attitudeEthics"
              type="number"
              min="0"
              max="100"
              value={formData.attitudeEthics}
              onChange={(e) =>
                handleInputChange("attitudeEthics", Number(e.target.value))
              }
              className={errors.attitudeEthics ? "border-red-500" : ""}
            />
            {errors.attitudeEthics && (
              <p className="text-sm text-red-500">{errors.attitudeEthics}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-500">
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
              Total Nilai Dosen Pembimbing
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {totalScore.toFixed(2)}
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

      {/* Summary Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nilai akhir mahasiswa akan dihitung dari kombinasi nilai dosen
          pembimbing dan nilai pembimbing lapangan dengan bobot masing-masing
          50%.
        </AlertDescription>
      </Alert>

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
