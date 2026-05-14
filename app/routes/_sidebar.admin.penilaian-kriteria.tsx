import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Save,
  RotateCcw,
  Settings2,
  AlertCircle,
  CheckCircle2,
  Scaling,
  Plus,
  Trash2,
} from "lucide-react";

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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  getAssessmentCriteria,
  updateAssessmentCriteria,
  DEFAULT_CRITERIA,
  DEFAULT_DOSEN_PA_CRITERIA,
  type AssessmentCriterion,
} from "~/lib/assessment-criteria-api";
import { hasAnyEvaluations } from "~/feature/evaluation/services/evaluation-api";

export default function PenilaianKriteriaPage() {
  const [activeRole, setActiveRole] = useState<"MENTOR" | "DOSEN_PA">("MENTOR");
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const totalWeight = useMemo(
    () => criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0),
    [criteria],
  );
  const isValid = totalWeight === 100;
  const weightDifference = 100 - totalWeight;

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [criteriaData, evaluationStatus] = await Promise.all([
          getAssessmentCriteria(activeRole),
          hasAnyEvaluations(),
        ]);
        setCriteria(criteriaData);
        setIsLocked(evaluationStatus);
      } catch (error) {
        console.error("Error loading criteria data:", error);
        toast.error("Gagal memuat data kriteria.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeRole]);

  function handleWeightChange(id: string, value: string) {
    const num = Math.max(0, Math.min(100, parseInt(value) || 0));
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weight: num } : c)),
    );
  }

  function handleDescriptionChange(id: string, value: string) {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, description: value } : c)),
    );
  }

  function handleCategoryNameChange(id: string, value: string) {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, category: value } : c)),
    );
  }

  function handleAddCategory() {
    const newId = `custom-${Date.now()}`;
    setCriteria((prev) => [
      ...prev,
      {
        id: newId,
        category: "Kategori Baru",
        description: "Deskripsi kategori baru",
        weight: 0,
        maxScore: 100,
      },
    ]);
    toast.success(
      "Kategori baru ditambahkan. Silakan sesuaikan nama, bobot, dan deskripsi.",
    );
  }

  function handleRemoveCategory(id: string) {
    setCriteria((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((c) => c.id !== id);
    });
    toast.info("Kategori dihapus dari daftar.");
  }

  function handleReset() {
    if (isLocked) {
      toast.error("Kriteria tidak dapat direset karena sudah ada data penilaian.");
      return;
    }
    setCriteria(activeRole === "DOSEN_PA" ? DEFAULT_DOSEN_PA_CRITERIA : DEFAULT_CRITERIA);
    toast.info(`Kriteria ${activeRole} direset ke nilai default`);
  }

  async function handleSave() {
    if (isLocked) {
      toast.error("Perubahan tidak dapat disimpan karena sudah ada data penilaian.");
      return;
    }
    if (!isValid) {
      toast.error(`Total bobot harus 100%, saat ini ${totalWeight}%`);
      return;
    }

    setIsSaving(true);
    const result = await updateAssessmentCriteria(criteria, activeRole);
    setIsSaving(false);

    if (result.success) {
      toast.success(`Kriteria penilaian ${activeRole} berhasil disimpan`);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Kriteria Penilaian
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Kelola bobot indikator penilaian untuk mahasiswa magang
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 bg-white/50 rounded-2xl border border-dashed">
          <div className="text-center space-y-3">
             <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
             <p className="text-sm text-muted-foreground">Memuat data kriteria {activeRole}...</p>
          </div>
        </div>
      ) : (
        <>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Kriteria */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Kriteria</p>
                <p className="text-2xl font-bold">{criteria.length}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Scaling className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Bobot */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Bobot</p>
                <p
                  className={`text-2xl font-bold ${isValid ? "text-green-600" : "text-amber-600"}`}
                >
                  {totalWeight}%
                </p>
              </div>
              <div
                className={`rounded-lg p-3 ${isValid ? "bg-green-500/10" : "bg-amber-500/10"}`}
              >
                {isValid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={isValid ? "default" : "destructive"}
                  className="w-fit text-xs font-medium"
                >
                  {isValid
                    ? "Siap Disimpan"
                    : `Selisih ${Math.abs(weightDifference)}%`}
                </Badge>
              </div>
              <div
                className={`rounded-lg p-3 ${isValid ? "bg-green-500/10" : "bg-red-500/10"}`}
              >
                {isValid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Selection Tabs */}
      <Tabs
        value={activeRole}
        onValueChange={(v) => setActiveRole(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="MENTOR">Mentor Lapangan</TabsTrigger>
          <TabsTrigger value="DOSEN_PA">Dosen PA</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Kriteria Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kriteria</CardTitle>
          <CardDescription>
            Edit bobot dan deskripsi untuk setiap kriteria penilaian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button variant="outline" onClick={handleAddCategory} disabled={isLocked}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="w-28">Bobot (%)</TableHead>
                  <TableHead className="text-right">Nilai Max</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((criterion) => (
                  <TableRow key={criterion.id}>
                    <TableCell>
                      <Input
                        value={criterion.category}
                        onChange={(e) =>
                          handleCategoryNameChange(criterion.id, e.target.value)
                        }
                        placeholder="Nama kategori"
                        className="text-sm h-8"
                        disabled={isLocked}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={criterion.description}
                        onChange={(e) =>
                          handleDescriptionChange(criterion.id, e.target.value)
                        }
                        placeholder="Tambahkan deskripsi..."
                        className="text-xs h-8"
                        disabled={isLocked}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={criterion.weight}
                          onChange={(e) =>
                            handleWeightChange(criterion.id, e.target.value)
                          }
                          className="h-8 pr-6 text-center font-medium"
                          disabled={isLocked}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {criterion.maxScore}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCategory(criterion.id)}
                        disabled={isLocked || criteria.length <= 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Weight Summary */}
          <div className="mt-4 space-y-3 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress Bobot</span>
                <span className="text-xs text-muted-foreground">
                  {totalWeight} dari 100%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isValid && "bg-green-500"
                  } ${!isValid && totalWeight > 100 && "bg-red-500"} ${
                    !isValid && totalWeight < 100 && "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(totalWeight, 100)}%` }}
                />
              </div>
            </div>

            {/* Kriteria Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {criteria.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md bg-muted px-2 py-1.5"
                >
                  <span className="text-xs text-muted-foreground truncate">
                    {c.category}
                  </span>
                  <Badge variant="secondary" className="text-xs ml-1">
                    {c.weight}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validasi Hint - Moved near action buttons or kept subtle */}
      {!isValid && !isLocked && (
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          <span>
            Total bobot saat ini <strong>{totalWeight}%</strong>. Harus tepat 100% untuk dapat disimpan. 
            (Selisih <strong>{weightDifference}%</strong>)
          </span>
        </div>
      )}

      {isValid && !isLocked && (
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-green-50 border border-green-100 text-green-700 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Total bobot 100% — Kriteria siap untuk disimpan.</span>
        </div>
      )}

      {isLocked && (
        <Alert variant="destructive" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-bold">Kriteria Terkunci</AlertTitle>
          <AlertDescription>
            Bobot penilaian tidak dapat diubah karena sudah terdapat mahasiswa yang telah dinilai pada periode ini. 
            Hal ini untuk menjaga konsistensi dan keadilan hasil evaluasi.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Button
          onClick={handleSave}
          disabled={!isValid || isSaving || isLocked}
          size="lg"
          className="sm:flex-1"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving || isLocked}
          size="lg"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset ke Default
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Catatan:</strong> Perubahan bobot/nama kategori hanya berlaku
          untuk penilaian yang dilakukan setelah perubahan disimpan. Penilaian
          yang sudah ada tidak terpengaruh kecuali dilakukan penilaian ulang.
        </AlertDescription>
      </Alert>
        </>
      )}
    </div>
  );
}
