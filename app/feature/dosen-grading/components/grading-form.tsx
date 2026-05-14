import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Info, Loader2, Save, FileText, Award, BarChart2, BookOpen, PenTool, ShieldCheck } from "lucide-react";
import type { GradingFormData } from "../types";
import { 
  getAssessmentCriteria, 
  type AssessmentCriterion 
} from "~/lib/assessment-criteria-api";
import { 
  getAssessmentScoreBarClass, 
  getAssessmentScoreTextClass 
} from "~/lib/assessment-score-style";

interface GradingFormProps {
  initialData?: Partial<GradingFormData>;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "pa-1": FileText,
  "pa-2": BookOpen,
  "pa-3": PenTool,
  "pa-4": ShieldCheck,
  "formatKesesuaian": FileText,
  "penguasaanMateri": BookOpen,
  "analisisPerancangan": PenTool,
  "sikapEtika": ShieldCheck,
};

export function GradingForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: GradingFormProps) {
  const { id } = useParams();
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getAssessmentCriteria("DOSEN_PA").then((data) => {
      setCriteria(data);
      const initialScores: Record<string, number> = {};
      
      data.forEach((c) => {
        let value = 0;
        
        // 1. Prioritas: Cari di initialData.components (Data dinamis dari DB)
        if (initialData?.components && Array.isArray(initialData.components)) {
          const comp = initialData.components.find(item => 
            item.categoryId === c.id || 
            item.name === c.category || 
            item.category === c.category
          );
          if (comp) {
            initialScores[c.id] = Number(comp.score) || 0;
            return;
          }
        }

        // 2. Fallback: Cari di legacy fields (untuk kriteria standar)
        const cid = c.id.toLowerCase();
        const cat = (c.category || "").toLowerCase();
        
        if (cid.includes("format") || cid === "pa-1" || cat.includes("format") || cat.includes("kesesuaian")) {
          value = initialData?.reportFormat || 0;
        } else if (cid.includes("materi") || cid === "pa-2" || cat.includes("materi") || cat.includes("penguasaan")) {
          value = initialData?.materialMastery || 0;
        } else if (cid.includes("analisis") || cid === "pa-3" || cat.includes("analisis") || cat.includes("perancangan") || cat.includes("analis")) {
          value = initialData?.analysisDesign || 0;
        } else if (cid.includes("sikap") || cid === "pa-4" || cat.includes("sikap") || cat.includes("etika")) {
          value = initialData?.attitudeEthics || 0;
        }
        
        initialScores[c.id] = value;
      });
      setScores(initialScores);
      setIsLoading(false);
    });
  }, [initialData]);

  const handleScoreChange = (id: string, value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value || 0));
    setScores((prev) => ({ ...prev, [id]: clampedValue }));
    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    criteria.forEach((c) => {
      const score = scores[c.id];
      if (score === undefined || score < 0 || score > 100) {
        newErrors[c.id] = "Nilai harus antara 0-100";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const result: any = {
        notes,
        reportFormat: 0,
        materialMastery: 0,
        analysisDesign: 0,
        attitudeEthics: 0,
        components: criteria.map(c => ({
          categoryId: c.id,
          category: c.category,
          score: scores[c.id] || 0,
          weight: c.weight
        }))
      };

      criteria.forEach((c) => {
        const score = scores[c.id] || 0;
        const cid = c.id.toLowerCase();
        const cat = (c.category || "").toLowerCase();

        if (cid.includes("format") || cid === "pa-1" || cat.includes("format") || cat.includes("kesesuaian")) {
          result.reportFormat = score;
        } else if (cid.includes("materi") || cid === "pa-2" || cat.includes("materi") || cat.includes("penguasaan")) {
          result.materialMastery = score;
        } else if (cid.includes("analisis") || cid === "pa-3" || cat.includes("analisis") || cat.includes("perancangan") || cat.includes("analis")) {
          result.analysisDesign = score;
        } else if (cid.includes("sikap") || cid === "pa-4" || cat.includes("sikap") || cat.includes("etika")) {
          result.attitudeEthics = score;
        }
      });

      onSubmit(result);
    }
  };

  const totalScore = useMemo(() => {
    return criteria.reduce((sum, c) => {
      const score = scores[c.id] || 0;
      return sum + (score * c.weight) / 100;
    }, 0);
  }, [criteria, scores]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Memuat kriteria penilaian...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Alert className="border-blue-500/40 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
          Bobot penilaian dosen pembimbing: {criteria.map(c => `${c.category} (${c.weight}%)`).join(", ")}.
        </AlertDescription>
      </Alert>

      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Nilai Rata-rata Sementara</p>
            <p className={`text-5xl font-black ${getAssessmentScoreTextClass(totalScore)}`}>
              {totalScore.toFixed(1)}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge className="bg-primary px-3">{totalScore >= 80 ? "A" : totalScore >= 70 ? "B" : totalScore >= 60 ? "C" : "D"}</Badge>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Skala 100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((criterion) => {
          const Icon = CATEGORY_ICONS[criterion.id] || CATEGORY_ICONS[criterion.categoryKey || ""] || BarChart2;
          const score = scores[criterion.id] || 0;

          return (
            <Card key={criterion.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{criterion.category}</CardTitle>
                      <CardDescription className="text-[11px] leading-tight">
                        {criterion.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-none">
                    {criterion.weight}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={criterion.id} className="text-xs font-medium text-muted-foreground uppercase">
                    Input Nilai
                  </Label>
                  <span className={`text-sm font-bold ${getAssessmentScoreTextClass(score)}`}>
                    {score} / 100
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id={criterion.id}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={scores[criterion.id] || ""}
                    onChange={(e) => handleScoreChange(criterion.id, Number(e.target.value))}
                    className={`h-11 ${errors[criterion.id] ? "border-red-500 bg-red-50" : "bg-gray-50/50"}`}
                  />
                  {errors[criterion.id] && (
                    <p className="text-[10px] text-red-500 mt-1">{errors[criterion.id]}</p>
                  )}
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getAssessmentScoreBarClass(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Notes Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Catatan & Feedback</CardTitle>
          <CardDescription>Berikan saran atau masukan untuk laporan mahasiswa</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tuliskan catatan evaluasi di sini..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="bg-gray-50/50"
          />
        </CardContent>
      </Card>

      {/* Final Action */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? "Menyimpan..." : "Simpan & Finalisasi"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} className="h-12 px-8">
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
