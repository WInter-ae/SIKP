// External dependencies
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, RotateCcw, Settings2, Info } from "lucide-react";

// Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";

// API
import {
  getAssessmentCriteria,
  updateAssessmentCriteria,
  DEFAULT_CRITERIA,
  type AssessmentCriterion,
} from "~/lib/assessment-criteria-api";

export default function PenilaianKriteriaPage() {
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const totalWeight = criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const isValid = totalWeight === 100;

  useEffect(() => {
    getAssessmentCriteria().then((data) => {
      setCriteria(data);
      setIsLoading(false);
    });
  }, []);

  function handleWeightChange(id: string, value: string) {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0));
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weight: num } : c))
    );
  }

  function handleDescriptionChange(id: string, value: string) {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, description: value } : c))
    );
  }

  function handleReset() {
    setCriteria(DEFAULT_CRITERIA);
    toast.info("Kriteria direset ke nilai default");
  }

  async function handleSave() {
    if (!isValid) {
      toast.error(`Total bobot harus 100%, saat ini ${totalWeight}%`);
      return;
    }

    setIsSaving(true);
    const result = await updateAssessmentCriteria(criteria);
    setIsSaving(false);

    if (result.success) {
      toast.success("Kriteria penilaian berhasil disimpan");
    } else {
      toast.error(result.message);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground text-sm">Memuat kriteria penilaian...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Kriteria Penilaian</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Kelola bobot indikator penilaian untuk mahasiswa magang. Perubahan berlaku untuk semua penilaian baru.
          </p>
        </div>
      </div>

      <Separator />

      {/* Validasi total bobot */}
      {!isValid && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Total bobot saat ini <strong>{totalWeight}%</strong>. Harus tepat{" "}
            <strong>100%</strong> sebelum bisa disimpan. Selisih:{" "}
            {totalWeight > 100 ? `+${totalWeight - 100}` : `${totalWeight - 100}`}%
          </AlertDescription>
        </Alert>
      )}

      {isValid && (
        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Total bobot <strong>100%</strong> — siap disimpan.
          </AlertDescription>
        </Alert>
      )}

      {/* Daftar kriteria */}
      <div className="space-y-4">
        {criteria.map((criterion) => (
          <Card key={criterion.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{criterion.category}</CardTitle>
                <Badge
                  variant={
                    Number(criterion.weight) > 0 ? "default" : "secondary"
                  }
                  className="text-sm px-3"
                >
                  {criterion.weight}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bobot */}
                <div className="space-y-2">
                  <Label htmlFor={`weight-${criterion.id}`}>
                    Bobot (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id={`weight-${criterion.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={criterion.weight}
                      onChange={(e) =>
                        handleWeightChange(criterion.id, e.target.value)
                      }
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>

                {/* Nilai maks */}
                <div className="space-y-2">
                  <Label>Nilai Maksimal</Label>
                  <Input
                    value={criterion.maxScore}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor={`desc-${criterion.id}`}>Deskripsi</Label>
                <Input
                  id={`desc-${criterion.id}`}
                  value={criterion.description}
                  onChange={(e) =>
                    handleDescriptionChange(criterion.id, e.target.value)
                  }
                  placeholder="Deskripsi kriteria..."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total bobot indicator */}
      <Card className={isValid ? "border-green-500/50" : "border-destructive/50"}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Bobot</span>
            <span
              className={`text-xl font-bold ${
                isValid ? "text-green-600" : "text-destructive"
              }`}
            >
              {totalWeight}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isValid
                  ? "bg-green-500"
                  : totalWeight > 100
                  ? "bg-destructive"
                  : "bg-yellow-500"
              }`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>
          {criteria.map((c) => (
            <div key={c.id} className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{c.category}</span>
              <span>{c.weight}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className="flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Default
        </Button>
      </div>

      {/* Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Catatan:</strong> Perubahan bobot hanya berlaku untuk penilaian yang dilakukan setelah perubahan disimpan. Penilaian yang sudah ada tidak terpengaruh.
        </AlertDescription>
      </Alert>
    </div>
  );
}
